from app.services.ai.ai_service import generate_violation_email
from datetime import datetime, timedelta
from app.database import drivers_collection, violations_collection, rewards_collection
from bson.objectid import ObjectId

# --- 1. CONFIGURATION ---
VIOLATION_RULES = {
    "RED_LIGHT":       {"weight": 5, "expiry": 180, "label": "Red Light Violation"},
    "WHITE_LINE":      {"weight": 3, "expiry": 90,  "label": "Crossing White Line"},
    "WRONG_OVERTAKE":  {"weight": 5, "expiry": 180, "label": "Wrong Side Overtake"},
    "PEDESTRIAN":      {"weight": 5, "expiry": 180, "label": "Pedestrian Crossing"},
    "MOTO_OVERLOAD":   {"weight": 3, "expiry": 90,  "label": "Motorcycle Overload"},
    "NO_HELMET":       {"weight": 5, "expiry": 180, "label": "No Helmet"},
    "3WHEEL_OVERLOAD": {"weight": 3, "expiry": 90,  "label": "Three-Wheel Overload"},
    "NO_SIGNAL":       {"weight": 2, "expiry": 60,  "label": "No Turn Signal"},
    "RAILWAY":         {"weight": 5, "expiry": 180, "label": "Railway Violation"},
    "OBSTRUCTION":     {"weight": 2, "expiry": 60,  "label": "Traffic Obstruction"}
}

class PenaltyService:

    # --- A. REGISTER VEHICLE ---
    def register_vehicle(self, plate_no: str, owner_name: str, owner_email: str, vehicle_type: str):
        existing = drivers_collection.find_one({"plate_no": plate_no})
        if existing:
            return {"status": "error", "msg": "Vehicle already registered"}
        
        new_driver = {
            "plate_no": plate_no,
            "name": owner_name,
            "email": owner_email, # Saving the email to MongoDB
            "vehicle_type": vehicle_type,
            "registered_at": datetime.now(),
            "contributor_level": "Silver",
            "upload_count": 0
        }
        
        result = drivers_collection.insert_one(new_driver)
        new_driver["_id"] = str(result.inserted_id)
        return {"status": "success", "driver": new_driver}

    # --- B. ADD VIOLATION ---
    def add_violation(self, plate_no: str, violation_code: str):
        # 1. SECURITY CHECK: Ensure Vehicle Exists
        driver = drivers_collection.find_one({"plate_no": plate_no})
        if not driver:
            raise ValueError(f"Vehicle '{plate_no}' is NOT registered in the system.")

        # 2. Validate Violation Code
        if violation_code not in VIOLATION_RULES:
            raise ValueError(f"Invalid Code: {violation_code}")
        
        rule = VIOLATION_RULES[violation_code]
        
        # 3. Count Repeats (Multiplier Logic)
        count = violations_collection.count_documents({
            "plate_no": plate_no, 
            "type": violation_code
        })
        count += 1
        
        multiplier = 1.0
        if count == 2: multiplier = 1.25
        elif count == 3: multiplier = 1.5
        elif count >= 5: multiplier = 2.0
        
        points = rule["weight"] * multiplier
        expiry_date = datetime.now() + timedelta(days=rule["expiry"])
        
        new_event = {
            "plate_no": plate_no,
            "type": violation_code,
            "label": rule["label"],
            "weight": rule["weight"],
            "multiplier": multiplier,
            "points": points,
            "timestamp": datetime.now(),
            "expiry_date": expiry_date
        }
        
        result = violations_collection.insert_one(new_event)
        new_event["_id"] = str(result.inserted_id)

        # --- NEW: AI EMAIL GENERATION ---
        # Fetch driver email to include in data (defaults to unknown if missing)
        driver_email = driver.get("email", "unknown@email.com")
        
        # Call the AI Service
        ai_email_text = generate_violation_email(
            driver_name=driver["name"],
            driver_email=driver_email,
            plate_no=plate_no,
            violation_label=rule["label"],
            points=points,
            expiry_date=expiry_date
        )

        # Save the generated email back to the database violation record
        violations_collection.update_one(
            {"_id": result.inserted_id},
            {"$set": {"generated_email": ai_email_text}}
        )
        
        # Calculate penalty split (Government 60%, Reward 25%, System 15%)
        penalty_amount = points * 500  # Base penalty calculation (500 LKR per point)
        penalty_split = {
            "government": round(penalty_amount * 0.60, 2),
            "reward": round(penalty_amount * 0.25, 2),
            "system": round(penalty_amount * 0.15, 2),
            "total": round(penalty_amount, 2)
        }
        
        # Add to return object so frontend sees it immediately
        new_event["generated_email"] = ai_email_text
        new_event["driver_email"] = driver_email
        new_event["penalty_split"] = penalty_split
        
        return new_event

    # --- C. GET PROFILE ---
    def get_full_profile(self, plate_no: str):
        driver = drivers_collection.find_one({"plate_no": plate_no})
        if not driver:
            return None
        
        driver["_id"] = str(driver["_id"])

        # Get violations
        cursor = violations_collection.find({"plate_no": plate_no})
        my_violations = list(cursor)
        
        # Get rewards (dashcam submissions)
        rewards_cursor = rewards_collection.find({"plate_no": plate_no})
        my_rewards = list(rewards_cursor)
        
        now = datetime.now()
        active_points = 0
        expired_points = 0
        penalty_timeline = {}
        type_counts = {}

        for v in my_violations:
            v["_id"] = str(v["_id"])
            
            month_key = v["timestamp"].strftime("%Y-%m")
            penalty_timeline[month_key] = penalty_timeline.get(month_key, 0) + 1
            type_counts[v["label"]] = type_counts.get(v["label"], 0) + 1

            if v["expiry_date"] > now:
                active_points += v["points"]
            else:
                expired_points += v["points"]

        # Process rewards data
        total_rewards = 0
        reward_timeline = {}
        reward_type_counts = {}
        
        for r in my_rewards:
            r["_id"] = str(r["_id"])
            total_rewards += r.get("amount", 0)
            
            month_key = r["timestamp"].strftime("%Y-%m")
            reward_timeline[month_key] = reward_timeline.get(month_key, 0) + 1
            
            reward_type = r.get("violation_reported", "Other")
            reward_type_counts[reward_type] = reward_type_counts.get(reward_type, 0) + 1

        risk = "Low"
        if active_points > 10: risk = "Moderate"
        if active_points > 20: risk = "High"
        if active_points > 30: risk = "Critical"
        
        # Determine contributor level based on rewards
        contributor_level = "Bronze"
        if len(my_rewards) >= 5: contributor_level = "Silver"
        if len(my_rewards) >= 15: contributor_level = "Gold"
        if len(my_rewards) >= 30: contributor_level = "Platinum"

        return {
            "profile": driver,
            "stats": {
                "active_points": round(active_points, 2),
                "expired_points": round(expired_points, 2),
                "risk_level": risk,
                "total_violations": len(my_violations),
                "total_rewards": round(total_rewards, 2),
                "total_contributions": len(my_rewards),
                "contributor_level": contributor_level
            },
            "charts": {
                "penalty_timeline": [{"month": k, "count": v} for k, v in penalty_timeline.items()],
                "reward_timeline": [{"month": k, "count": v} for k, v in reward_timeline.items()],
                "violation_types": [{"type": k, "count": v} for k, v in type_counts.items()],
                "reward_types": [{"type": k, "count": v} for k, v in reward_type_counts.items()],
                "points_split": [active_points, expired_points]
            },
            "recent_violations": my_violations[-5:],
            "recent_rewards": my_rewards[-5:]
        }
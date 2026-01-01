from datetime import datetime, timedelta
from app.database import drivers_collection, violations_collection
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
    def register_vehicle(self, plate_no: str, owner_name: str, vehicle_type: str):
        existing = drivers_collection.find_one({"plate_no": plate_no})
        if existing:
            return {"status": "error", "msg": "Vehicle already registered"}
        
        new_driver = {
            "plate_no": plate_no,
            "name": owner_name,
            "vehicle_type": vehicle_type,
            "registered_at": datetime.now(),
            "contributor_level": "Silver",
            "upload_count": 0
        }
        
        result = drivers_collection.insert_one(new_driver)
        new_driver["_id"] = str(result.inserted_id)
        return {"status": "success", "driver": new_driver}

    # --- B. ADD VIOLATION (UPDATED HERE) ---
    def add_violation(self, plate_no: str, violation_code: str):
        # 1. SECURITY CHECK: Ensure Vehicle Exists [NEW ADDITION]
        # If the driver is not in the database, stop immediately.
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
        return new_event

    # --- C. GET PROFILE ---
    def get_full_profile(self, plate_no: str):
        driver = drivers_collection.find_one({"plate_no": plate_no})
        if not driver:
            return None
        
        driver["_id"] = str(driver["_id"])

        cursor = violations_collection.find({"plate_no": plate_no})
        my_violations = list(cursor)
        
        now = datetime.now()
        active_points = 0
        expired_points = 0
        timeline_data = {}
        type_counts = {}

        for v in my_violations:
            v["_id"] = str(v["_id"])
            
            month_key = v["timestamp"].strftime("%Y-%m")
            timeline_data[month_key] = timeline_data.get(month_key, 0) + 1
            type_counts[v["label"]] = type_counts.get(v["label"], 0) + 1

            if v["expiry_date"] > now:
                active_points += v["points"]
            else:
                expired_points += v["points"]

        risk = "Low"
        if active_points > 10: risk = "Moderate"
        if active_points > 20: risk = "High"
        if active_points > 30: risk = "Critical"

        return {
            "profile": driver,
            "stats": {
                "active_points": round(active_points, 2),
                "expired_points": round(expired_points, 2),
                "risk_level": risk,
                "total_events": len(my_violations)
            },
            "charts": {
                "timeline": [{"month": k, "count": v} for k, v in timeline_data.items()],
                "distribution": [{"type": k, "count": v} for k, v in type_counts.items()],
                "points_split": [active_points, expired_points]
            },
            "recent_history": my_violations[-5:] 
        }
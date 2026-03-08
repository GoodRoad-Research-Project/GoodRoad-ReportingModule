from app.services.ai.ai_service import generate_violation_email
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Driver, Violation, Reward

# --- 1. CONFIGURATION ---
VIOLATION_RULES = {
    "OVER_SPEED":          {"weight": 4, "expiry": 120, "label": "Excessive Speeding"},
    "NO_LICENSE":         {"weight": 8, "expiry": 365, "label": "Driving Without a Valid Driving License"},
    "NO_INSURANCE":       {"weight": 10, "expiry": 365, "label": "Driving Without a Valid Insurance Cover"},
    "NO_REVENUE_LIC":     {"weight": 6, "expiry": 180, "label": "Failing to Carry or Display Valid Revenue License"},
    "UNDERAGE_DRIVE":     {"weight": 10, "expiry": 365, "label": "Driving by an Underaged Person"},
    "RECKLESS_DRIVING":   {"weight": 9, "expiry": 365, "label": "Reckless or Dangerous Driving"},
    "CARELESS_DRIVING":   {"weight": 5, "expiry": 180, "label": "Driving Carelessly or Without Due Regard"},
    "MOBILE_PHONE":       {"weight": 5, "expiry": 180, "label": "Using a Mobile Phone While Driving"},
    "LEFT_OVERTAKE":      {"weight": 6, "expiry": 180, "label": "Overtaking from the Left"},
    "NO_SEATBELT":        {"weight": 3, "expiry": 90, "label": "Failing to Wear a Seatbelt"},
    "NO_HELMET":          {"weight": 5, "expiry": 180, "label": "Riding a Motorcycle Without a Helmet"},
    "RED_LIGHT":          {"weight": 6, "expiry": 180, "label": "Disobeying Traffic Light Signals"},
    "DISOBEY_POLICE":     {"weight": 7, "expiry": 270, "label": "Disobeying Police Officer Signals"},
    "DISOBEY_SIGNS":      {"weight": 4, "expiry": 120, "label": "Disobeying Standard Traffic Signs"},
    "WHITE_LINE":         {"weight": 4, "expiry": 120, "label": "Crossing the Solid White Line"},
    "WRONG_PARKING":      {"weight": 2, "expiry": 60, "label": "Illegal or Wrong Parking"},
    "PEDESTRIAN_CROSS":   {"weight": 6, "expiry": 180, "label": "Failure to Yield at a Pedestrian Crossing"},
    "ONE_WAY":            {"weight": 7, "expiry": 270, "label": "Driving Against One-Way Traffic"},
    "RAILWAY_CROSS":      {"weight": 8, "expiry": 365, "label": "Haphazard Railway Crossing"},
    "OVERLOAD_PASS":      {"weight": 4, "expiry": 120, "label": "Carrying Excess Passengers"},
    "DANGEROUS_LOAD":     {"weight": 5, "expiry": 150, "label": "Carrying an Improperly Secured or Dangerous Load"},
    "EMISSION_FAIL":      {"weight": 3, "expiry": 90, "label": "Vehicle Emission Limit Violation"},
    "SHRILL_HORN":        {"weight": 2, "expiry": 60, "label": "Use of Prohibited or Shrill Horn"},
    "DEFECTIVE_LIGHTS":   {"weight": 3, "expiry": 90, "label": "Driving with Defective Headlights or Taillights"},
    "UNFIT_VEHICLE":      {"weight": 5, "expiry": 150, "label": "Driving a Mechanically Defective Vehicle"},
    "OBSCURED_PLATES":    {"weight": 4, "expiry": 120, "label": "Driving with Unclear or Obscured Identification Plates"},
    "ROAD_OBSTRUCT":      {"weight": 3, "expiry": 90, "label": "Causing Unnecessary Obstruction on the Road"},
    "ILLEGAL_REVERSE":    {"weight": 3, "expiry": 90, "label": "Reversing a Vehicle an Unreasonable Distance"},
    "NO_FITNESS_CERT":    {"weight": 6, "expiry": 180, "label": "Driving a Commercial Vehicle Without a Fitness Certificate"},
    "BLOCK_EMERGENCY":    {"weight": 8, "expiry": 270, "label": "Failing to Yield to an Emergency Vehicle"}
}

class PenaltyService:

    # --- A. REGISTER VEHICLE ---
    def register_vehicle(self, db: Session, plate_no: str, owner_name: str, owner_email: str, vehicle_type: str):
        # Check if vehicle already exists
        existing = db.query(Driver).filter(Driver.plate_no == plate_no).first()
        if existing:
            return {"status": "error", "msg": "Vehicle already registered"}
        
        # Create new driver record
        new_driver = Driver(
            plate_no=plate_no,
            name=owner_name,
            email=owner_email,
            vehicle_type=vehicle_type,
            registered_at=datetime.now(),
            contributor_level="Silver",
            upload_count=0
        )
        
        db.add(new_driver)
        db.commit()
        db.refresh(new_driver)
        
        return {
            "status": "success", 
            "driver": {
                "id": new_driver.id,
                "plate_no": new_driver.plate_no,
                "name": new_driver.name,
                "email": new_driver.email,
                "vehicle_type": new_driver.vehicle_type,
                "registered_at": new_driver.registered_at.isoformat(),
                "contributor_level": new_driver.contributor_level,
                "upload_count": new_driver.upload_count
            }
        }

    # --- B. DELETE VEHICLE ---
    def delete_vehicle(self, db: Session, plate_no: str):
        # Find the vehicle
        driver = db.query(Driver).filter(Driver.plate_no == plate_no).first()
        if not driver:
            return {"status": "error", "msg": "Vehicle not found"}
        
        # Delete all associated violations
        db.query(Violation).filter(Violation.plate_no == plate_no).delete()
        
        # Delete all associated rewards
        db.query(Reward).filter(Reward.plate_no == plate_no).delete()
        
        # Delete the driver record
        db.delete(driver)
        db.commit()
        
        return {
            "status": "success",
            "msg": f"Vehicle {plate_no} and all associated records deleted successfully"
        }

    # --- C. ADD VIOLATION ---
    def add_violation(self, db: Session, plate_no: str, violation_code: str):
        # 1. SECURITY CHECK: Ensure Vehicle Exists
        driver = db.query(Driver).filter(Driver.plate_no == plate_no).first()
        if not driver:
            raise ValueError(f"Vehicle '{plate_no}' is NOT registered in the system.")

        # 2. Validate Violation Code
        if violation_code not in VIOLATION_RULES:
            raise ValueError(f"Invalid Code: {violation_code}")
        
        rule = VIOLATION_RULES[violation_code]
        
        # 3. Count Repeats (Multiplier Logic)
        count = db.query(Violation).filter(
            Violation.plate_no == plate_no,
            Violation.type == violation_code
        ).count()
        count += 1
        
        multiplier = 1.0
        if count == 2: multiplier = 1.25
        elif count == 3: multiplier = 1.5
        elif count >= 5: multiplier = 2.0
        
        points = rule["weight"] * multiplier
        expiry_date = datetime.now() + timedelta(days=rule["expiry"])
        
        # Create new violation record
        new_violation = Violation(
            plate_no=plate_no,
            type=violation_code,
            label=rule["label"],
            weight=rule["weight"],
            multiplier=multiplier,
            points=points,
            timestamp=datetime.now(),
            expiry_date=expiry_date
        )
        
        db.add(new_violation)
        db.commit()
        db.refresh(new_violation)

        # --- AI EMAIL GENERATION ---
        driver_email = driver.email
        
        # Call the AI Service
        ai_email_text = generate_violation_email(
            driver_name=driver.name,
            driver_email=driver_email,
            plate_no=plate_no,
            violation_label=rule["label"],
            points=points,
            expiry_date=expiry_date
        )

        # Save the generated email back to the database violation record
        new_violation.generated_email = ai_email_text
        db.commit()
        
        # Calculate penalty split (Government 60%, Reward 25%, System 15%)
        penalty_amount = points * 500  # Base penalty calculation (500 LKR per point)
        penalty_split = {
            "government": round(penalty_amount * 0.60, 2),
            "reward": round(penalty_amount * 0.25, 2),
            "system": round(penalty_amount * 0.15, 2),
            "total": round(penalty_amount, 2)
        }
        
        # Return violation data for frontend
        return {
            "id": new_violation.id,
            "plate_no": new_violation.plate_no,
            "type": new_violation.type,
            "label": new_violation.label,
            "weight": new_violation.weight,
            "multiplier": new_violation.multiplier,
            "points": new_violation.points,
            "timestamp": new_violation.timestamp.isoformat(),
            "expiry_date": new_violation.expiry_date.isoformat(),
            "generated_email": ai_email_text,
            "driver_email": driver_email,
            "penalty_split": penalty_split
        }

    # --- D. GET PROFILE ---
    def get_full_profile(self, db: Session, plate_no: str):
        # Get driver
        driver = db.query(Driver).filter(Driver.plate_no == plate_no).first()
        if not driver:
            return None
        
        # Get violations
        my_violations = db.query(Violation).filter(Violation.plate_no == plate_no).all()
        
        # Get rewards (dashcam submissions)
        my_rewards = db.query(Reward).filter(Reward.plate_no == plate_no).all()
        
        now = datetime.now()
        active_points = 0
        expired_points = 0
        penalty_timeline = {}
        type_counts = {}

        # Process violations
        violations_list = []
        for v in my_violations:
            violations_list.append({
                "id": v.id,
                "plate_no": v.plate_no,
                "type": v.type,
                "label": v.label,
                "weight": v.weight,
                "multiplier": v.multiplier,
                "points": v.points,
                "timestamp": v.timestamp.isoformat(),
                "expiry_date": v.expiry_date.isoformat()
            })
            
            month_key = v.timestamp.strftime("%Y-%m")
            penalty_timeline[month_key] = penalty_timeline.get(month_key, 0) + 1
            type_counts[v.label] = type_counts.get(v.label, 0) + 1

            if v.expiry_date > now:
                active_points += v.points
            else:
                expired_points += v.points

        # Process rewards data
        total_rewards = 0
        reward_timeline = {}
        reward_type_counts = {}
        rewards_list = []
        
        for r in my_rewards:
            rewards_list.append({
                "id": r.id,
                "plate_no": r.plate_no,
                "violation_reported": r.violation_reported,
                "amount": r.amount,
                "timestamp": r.timestamp.isoformat(),
                "status": r.status
            })
            
            total_rewards += r.amount
            
            month_key = r.timestamp.strftime("%Y-%m")
            reward_timeline[month_key] = reward_timeline.get(month_key, 0) + 1
            
            reward_type_counts[r.violation_reported] = reward_type_counts.get(r.violation_reported, 0) + 1

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
            "profile": {
                "id": driver.id,
                "plate_no": driver.plate_no,
                "name": driver.name,
                "email": driver.email,
                "vehicle_type": driver.vehicle_type,
                "registered_at": driver.registered_at.isoformat(),
                "contributor_level": contributor_level,
                "upload_count": driver.upload_count
            },
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
            "recent_violations": violations_list[-5:],
            "recent_rewards": rewards_list[-5:]
        }
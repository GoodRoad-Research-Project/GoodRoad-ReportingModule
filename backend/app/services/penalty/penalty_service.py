from datetime import datetime, timedelta
from typing import List, Dict, Optional

# --- 1. CONFIGURATION: 10 REAL VIOLATION TYPES ---
# Weights: High=5, Medium=3, Low=2 [cite: 1032-1035]
# Expiry: High=180, Medium=90, Low=60 days [cite: 1048-1051]
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

# --- IN-MEMORY DATABASE (Simulating DB) ---
drivers_db = []     # Stores registered vehicles
violations_db = []  # Stores violation events

class PenaltyService:

    # --- A. REGISTER VEHICLE (New Requirement) ---
    def register_vehicle(self, plate_no: str, owner_name: str, vehicle_type: str):
        # Check if already exists
        for d in drivers_db:
            if d["plate_no"] == plate_no:
                return {"status": "error", "msg": "Vehicle already registered"}
        
        new_driver = {
            "plate_no": plate_no,
            "name": owner_name,
            "vehicle_type": vehicle_type,
            "registered_at": datetime.now(),
            "contributor_level": "Silver", # Default [cite: 1019]
            "upload_count": 0
        }
        drivers_db.append(new_driver)
        return {"status": "success", "driver": new_driver}

    # --- B. ADD VIOLATION LOGIC ---
    def add_violation(self, plate_no: str, violation_code: str):
        # 1. Validate Code
        if violation_code not in VIOLATION_RULES:
            raise ValueError(f"Invalid Code: {violation_code}")
        
        rule = VIOLATION_RULES[violation_code]
        
        # 2. Calculate Repeats (Multiplier Logic) [cite: 1037-1041]
        user_history = [v for v in violations_db if v["plate_no"] == plate_no and v["type"] == violation_code]
        count = len(user_history) + 1
        
        multiplier = 1.0
        if count == 2: multiplier = 1.25
        elif count == 3: multiplier = 1.5
        elif count >= 5: multiplier = 2.0
        
        # 3. Calculate Points & Expiry
        points = rule["weight"] * multiplier
        expiry_date = datetime.now() + timedelta(days=rule["expiry"])
        
        new_event = {
            "id": len(violations_db) + 1,
            "plate_no": plate_no,
            "type": violation_code,
            "label": rule["label"],
            "weight": rule["weight"],
            "multiplier": multiplier,
            "points": points,
            "timestamp": datetime.now(),
            "expiry_date": expiry_date
        }
        violations_db.append(new_event)
        return new_event

    # --- C. GET SCORE & CHARTS DATA ---
    def get_full_profile(self, plate_no: str):
        # 1. Find Driver
        driver = next((d for d in drivers_db if d["plate_no"] == plate_no), None)
        if not driver:
            return None # Driver not found

        # 2. Filter Violations for this driver
        my_violations = [v for v in violations_db if v["plate_no"] == plate_no]
        
        # 3. Calculate Scores (Active vs Expired) [cite: 1057]
        now = datetime.now()
        active_points = 0
        expired_points = 0
        
        timeline_data = {} # For Chart 1
        type_counts = {}   # For Chart 2

        for v in my_violations:
            # Chart 1: Timeline (Group by Month)
            month_key = v["timestamp"].strftime("%Y-%m") # e.g., "2025-08"
            timeline_data[month_key] = timeline_data.get(month_key, 0) + 1

            # Chart 2: Type Dist (Group by Label)
            type_counts[v["label"]] = type_counts.get(v["label"], 0) + 1

            # Score Calculation
            if v["expiry_date"] > now:
                active_points += v["points"]
            else:
                expired_points += v["points"]

        # 4. Risk Level [cite: 1026]
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
            "recent_history": my_violations[-5:] # Last 5 events
        }
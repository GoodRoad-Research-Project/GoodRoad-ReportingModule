from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.penalty.penalty_service import PenaltyService

router = APIRouter()
service = PenaltyService()

# Request Models
class VehicleReg(BaseModel):
    plate_no: str
    owner_name: str
    email: str
    vehicle_type: str

class ViolationAdd(BaseModel):
    plate_no: str
    violation_code: str

# 1. Register Vehicle Endpoint
@router.post("/register")
def register_vehicle(data: VehicleReg):
    result = service.register_vehicle(data.plate_no, data.owner_name, data.email, data.vehicle_type)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["msg"])
    return result

# 2. Add Violation Endpoint
@router.post("/add")
def add_violation(data: ViolationAdd):
    try:
        return service.add_violation(data.plate_no, data.violation_code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# 3. Get Full Profile (Charts + Score)
@router.get("/user/{plate_no}/full_profile")
def get_full_profile(plate_no: str):
    data = service.get_full_profile(plate_no)
    if not data:
        raise HTTPException(status_code=404, detail="Vehicle not found. Please register first.")
    return data
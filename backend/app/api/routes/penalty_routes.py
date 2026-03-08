from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.services.penalty.penalty_service import PenaltyService
from app.database import get_db

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
def register_vehicle(data: VehicleReg, db: Session = Depends(get_db)):
    result = service.register_vehicle(db, data.plate_no, data.owner_name, data.email, data.vehicle_type)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["msg"])
    return result

# 2. Delete Vehicle Endpoint
@router.delete("/delete/{plate_no}")
def delete_vehicle(plate_no: str, db: Session = Depends(get_db)):
    result = service.delete_vehicle(db, plate_no)
    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["msg"])
    return result

# 3. Add Violation Endpoint
@router.post("/add")
def add_violation(data: ViolationAdd, db: Session = Depends(get_db)):
    try:
        return service.add_violation(db, data.plate_no, data.violation_code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# 4. Get Full Profile (Charts + Score)
@router.get("/user/{plate_no}/full_profile")
def get_full_profile(plate_no: str, db: Session = Depends(get_db)):
    data = service.get_full_profile(db, plate_no)
    if not data:
        raise HTTPException(status_code=404, detail="Vehicle not found. Please register first.")
    return data
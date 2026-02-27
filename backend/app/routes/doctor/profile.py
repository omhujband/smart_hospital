from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import Doctor
from app.models.schemas import DoctorResponse

router = APIRouter(prefix="/doctor/profile", tags=["Doctor - Profile"])

@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_my_profile(doctor_id: int, db: Session = Depends(get_db)):
    """Get doctor's profile by ID"""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@router.patch("/{doctor_id}/availability")
def update_availability(doctor_id: int, is_available: bool, db: Session = Depends(get_db)):
    """Update doctor availability (e.g. stepping out, going on break)"""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    doctor.is_available = is_available
    db.commit()
    return {"message": "Availability updated", "is_available": is_available}
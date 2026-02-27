from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import Doctor
from app.models.schemas import DoctorCreate, DoctorResponse
from typing import List

router = APIRouter(prefix="/receptionist/doctors", tags=["Receptionist - Doctors"])

@router.post("/", response_model=DoctorResponse)
def register_doctor(doctor: DoctorCreate, db: Session = Depends(get_db)):
    """Register a new doctor to the hospital"""
    db_doctor = Doctor(**doctor.dict())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@router.get("/", response_model=List[DoctorResponse])
def get_doctors(db: Session = Depends(get_db)):
    """Get all doctors (used by receptionists to see who to schedule with)"""
    return db.query(Doctor).all()
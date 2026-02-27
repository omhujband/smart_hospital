from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import Patient
from app.models.schemas import PatientCreate, PatientResponse
from typing import List

router = APIRouter(prefix="/receptionist/patients", tags=["Receptionist - Patients"])

@router.post("/", response_model=PatientResponse)
def onboard_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    """Register a new patient"""
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/", response_model=List[PatientResponse])
def get_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all patients"""
    patients = db.query(Patient).offset(skip).limit(limit).all()
    return patients

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get patient by ID"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
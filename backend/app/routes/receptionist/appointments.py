from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import Appointment, Doctor, Patient, AppointmentStatus
from app.models.schemas import AppointmentCreate, AppointmentResponse
from app.services.ai_service import ai_service
from typing import List

router = APIRouter(prefix="/receptionist/appointments", tags=["Receptionist - Appointments"])

@router.post("/", response_model=AppointmentResponse)
def schedule_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    """Create a new appointment with AI wait time prediction"""
    patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    db_appointment = Appointment(
        **appointment.dict(),
        estimated_duration=doctor.avg_consultation_time
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)

    try:
        predicted_wait = ai_service.predict_wait_time(db, db_appointment.id)
        db_appointment.predicted_wait_time = predicted_wait
        db.commit()
        db.refresh(db_appointment)
    except Exception as e:
        print(f"Wait time prediction failed: {e}")

    return db_appointment

@router.get("/queue", response_model=List[AppointmentResponse])
def view_global_queue(status: str = None, department: str = None, db: Session = Depends(get_db)):
    """Get global appointments with filters for receptionist dashboard"""
    query = db.query(Appointment)
    if status:
        query = query.filter(Appointment.status == AppointmentStatus(status))
    if department:
        query = query.filter(Appointment.department == department)
    return query.all()

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """Get specific appointment details"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment
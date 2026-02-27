from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import Appointment, Doctor, Patient, AppointmentStatus
from app.models.schemas import AppointmentCreate, AppointmentResponse, WaitTimePrediction
from app.services.ai_service import ai_service
from typing import List
from datetime import datetime

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.post("/", response_model=AppointmentResponse)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    """Create a new appointment with AI wait time prediction"""
    
    # Validate patient and doctor exist
    patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Create appointment
    db_appointment = Appointment(
        **appointment.dict(),
        estimated_duration=doctor.avg_consultation_time
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    # Predict wait time using AI
    try:
        predicted_wait = ai_service.predict_wait_time(db, db_appointment.id)
        db_appointment.predicted_wait_time = predicted_wait
        db.commit()
        db.refresh(db_appointment)
    except Exception as e:
        print(f"Wait time prediction failed: {e}")
    
    return db_appointment

@router.get("/", response_model=List[AppointmentResponse])
def get_appointments(
    status: str = None,
    doctor_id: int = None,
    department: str = None,
    db: Session = Depends(get_db)
):
    """Get appointments with filters"""
    query = db.query(Appointment)
    
    if status:
        query = query.filter(Appointment.status == AppointmentStatus(status))
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    if department:
        query = query.filter(Appointment.department == department)
    
    appointments = query.all()
    print(f"Found {len(appointments)} appointments with status={status}")
    return appointments

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """Get appointment by ID"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@router.get("/{appointment_id}/predict-wait", response_model=WaitTimePrediction)
def predict_wait_time(appointment_id: int, db: Session = Depends(get_db)):
    """Get AI-predicted wait time for appointment"""
    
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    predicted_wait = ai_service.predict_wait_time(db, appointment_id)
    
    estimated_start = appointment.scheduled_time
    if predicted_wait > 0:
        from datetime import timedelta
        estimated_start = appointment.scheduled_time + timedelta(minutes=predicted_wait)
    
    return WaitTimePrediction(
        appointment_id=appointment_id,
        predicted_wait_time=predicted_wait,
        queue_position=appointment.queue_position or 0,
        estimated_start_time=estimated_start
    )

@router.patch("/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update appointment status"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = AppointmentStatus(status)
    
    if status == "In Progress":
        appointment.actual_start_time = datetime.now()
    elif status == "Completed":
        appointment.actual_end_time = datetime.now()
    
    db.commit()
    return {"message": "Status updated", "status": status}

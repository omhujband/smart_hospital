from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import Appointment, AppointmentStatus
from app.models.schemas import AppointmentResponse, WaitTimePrediction
from app.services.ai_service import ai_service
from typing import List
from datetime import datetime

router = APIRouter(prefix="/doctor/consultations", tags=["Doctor - Consultations"])

@router.get("/{doctor_id}/queue", response_model=List[AppointmentResponse])
def get_my_queue(doctor_id: int, status: str = None, db: Session = Depends(get_db)):
    """Get appointments strictly filtered for the logged-in doctor"""
    query = db.query(Appointment).filter(Appointment.doctor_id == doctor_id)
    if status:
        query = query.filter(Appointment.status == AppointmentStatus(status))
    return query.all()

@router.patch("/{doctor_id}/appointments/{appointment_id}/status")
def update_consultation_status(
    doctor_id: int,
    appointment_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Doctor updating the status (e.g., IN_PROGRESS, COMPLETED)"""
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.doctor_id == doctor_id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found or not assigned to you")

    appointment.status = AppointmentStatus(status)

    if status == "In Progress":
        appointment.actual_start_time = datetime.now()
    elif status == "Completed":
        appointment.actual_end_time = datetime.now()

    db.commit()
    return {"message": "Status updated", "status": status}

@router.get("/{doctor_id}/appointments/{appointment_id}/predict-wait", response_model=WaitTimePrediction)
def predict_wait_time(doctor_id: int, appointment_id: int, db: Session = Depends(get_db)):
    """Get AI-predicted wait time for a specific patient in this doctor's queue"""
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.doctor_id == doctor_id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found or not assigned to you")

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
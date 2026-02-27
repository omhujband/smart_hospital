from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import Appointment, Doctor, AppointmentStatus, QueueMetrics
from app.models.schemas import OptimizedSchedule, QueueStatus, AnalyticsSummary, AppointmentResponse
from app.services.ai_service import ai_service
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/optimize")
def optimize_schedule(doctor_id: int = None, department: str = None, db: Session = Depends(get_db)):
    """Run AI optimization on appointments"""
    
    result = ai_service.optimize_appointments(db, doctor_id, department)
    
    return {
        "status": "success",
        "total_appointments": result['total_appointments'],
        "avg_wait_time": round(result['avg_wait_time'], 2),
        "doctor_utilization": round(result['doctor_utilization'], 2),
        "message": f"Optimized {result['total_appointments']} appointments"
    }

@router.post("/reoptimize")
def real_time_reoptimize(db: Session = Depends(get_db)):
    """Real-time re-optimization for current queue"""
    
    result = ai_service.real_time_reoptimize(db)
    
    return {
        "status": "success",
        "total_appointments": result['total_appointments'],
        "avg_wait_time": round(result['avg_wait_time'], 2),
        "doctor_utilization": round(result['doctor_utilization'], 2),
        "timestamp": datetime.now().isoformat()
    }

@router.get("/queue/{department}", response_model=QueueStatus)
def get_queue_status(department: str, db: Session = Depends(get_db)):
    """Get current queue status for department"""
    
    appointments = db.query(Appointment).filter(
        Appointment.department == department,
        Appointment.status == AppointmentStatus.SCHEDULED
    ).all()
    
    total_waiting = len(appointments)
    avg_wait = sum(apt.predicted_wait_time for apt in appointments) / total_waiting if total_waiting > 0 else 0
    
    return QueueStatus(
        department=department,
        total_waiting=total_waiting,
        avg_wait_time=round(avg_wait, 2),
        current_patients=[AppointmentResponse.from_orm(apt) for apt in appointments[:10]]
    )

@router.get("/analytics", response_model=AnalyticsSummary)
def get_analytics(db: Session = Depends(get_db)):
    """Get hospital analytics summary"""
    
    today = datetime.now().replace(hour=0, minute=0, second=0)
    
    appointments = db.query(Appointment).filter(
        Appointment.scheduled_time >= today
    ).all()
    
    total_appointments = len(appointments)
    
    if total_appointments == 0:
        return AnalyticsSummary(
            total_appointments=0,
            avg_wait_time=0,
            avg_consultation_time=0,
            doctor_utilization=0,
            patients_per_hour=0
        )
    
    avg_wait = sum(apt.predicted_wait_time for apt in appointments) / total_appointments
    
    completed = [apt for apt in appointments if apt.actual_end_time and apt.actual_start_time]
    avg_consultation = 0
    if completed:
        consultation_times = [(apt.actual_end_time - apt.actual_start_time).total_seconds() / 60 for apt in completed]
        avg_consultation = sum(consultation_times) / len(consultation_times)
    
    # Calculate utilization
    doctors = db.query(Doctor).all()
    total_working_minutes = len(doctors) * 8 * 60  # 8 hours per doctor
    total_appointment_minutes = sum(apt.estimated_duration for apt in appointments)
    doctor_utilization = (total_appointment_minutes / total_working_minutes * 100) if total_working_minutes > 0 else 0
    
    hours_elapsed = (datetime.now() - today).total_seconds() / 3600
    patients_per_hour = total_appointments / hours_elapsed if hours_elapsed > 0 else 0
    
    return AnalyticsSummary(
        total_appointments=total_appointments,
        avg_wait_time=round(avg_wait, 2),
        avg_consultation_time=round(avg_consultation, 2),
        doctor_utilization=round(doctor_utilization, 2),
        patients_per_hour=round(patients_per_hour, 2)
    )

@router.get("/schedule/{doctor_id}", response_model=OptimizedSchedule)
def get_doctor_schedule(doctor_id: int, db: Session = Depends(get_db)):
    """Get optimized schedule for specific doctor"""
    
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        return {"error": "Doctor not found"}
    
    appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status == AppointmentStatus.SCHEDULED
    ).order_by(Appointment.scheduled_time).all()
    
    total_patients = len(appointments)
    avg_wait = sum(apt.predicted_wait_time for apt in appointments) / total_patients if total_patients > 0 else 0
    
    working_minutes = 8 * 60
    appointment_minutes = sum(apt.estimated_duration for apt in appointments)
    utilization = (appointment_minutes / working_minutes * 100) if working_minutes > 0 else 0
    
    return OptimizedSchedule(
        doctor_id=doctor_id,
        doctor_name=doctor.name,
        appointments=[AppointmentResponse.from_orm(apt) for apt in appointments],
        total_patients=total_patients,
        avg_wait_time=round(avg_wait, 2),
        utilization_rate=round(utilization, 2)
    )

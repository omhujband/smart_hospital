from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class DepartmentType(str, Enum):
    CARDIOLOGY = "Cardiology"
    NEUROLOGY = "Neurology"
    ORTHOPEDICS = "Orthopedics"
    PEDIATRICS = "Pediatrics"
    GENERAL = "General"
    EMERGENCY = "Emergency"

class AppointmentStatus(str, Enum):
    SCHEDULED = "Scheduled"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class PatientCreate(BaseModel):
    name: str
    age: int
    phone: str
    is_emergency: bool = False

class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    phone: str
    is_emergency: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class DoctorCreate(BaseModel):
    name: str
    department: DepartmentType
    avg_consultation_time: int = 20
    start_time: str = "09:00"
    end_time: str = "17:00"

class DoctorResponse(BaseModel):
    id: int
    name: str
    department: DepartmentType
    avg_consultation_time: int
    start_time: str
    end_time: str
    is_available: bool
    
    class Config:
        from_attributes = True

class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    department: DepartmentType
    scheduled_time: datetime
    is_emergency: bool = False

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    department: DepartmentType
    scheduled_time: datetime
    estimated_duration: int
    predicted_wait_time: float
    status: AppointmentStatus
    queue_position: Optional[int]
    
    class Config:
        from_attributes = True

class WaitTimePrediction(BaseModel):
    appointment_id: int
    predicted_wait_time: float
    queue_position: int
    estimated_start_time: datetime

class OptimizedSchedule(BaseModel):
    doctor_id: int
    doctor_name: str
    appointments: List[AppointmentResponse]
    total_patients: int
    avg_wait_time: float
    utilization_rate: float

class QueueStatus(BaseModel):
    department: DepartmentType
    total_waiting: int
    avg_wait_time: float
    current_patients: List[AppointmentResponse]

class AnalyticsSummary(BaseModel):
    total_appointments: int
    avg_wait_time: float
    avg_consultation_time: float
    doctor_utilization: float
    patients_per_hour: float

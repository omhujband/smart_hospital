from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.database.connection import Base
from datetime import datetime
import enum

class DepartmentType(enum.Enum):
    CARDIOLOGY = "Cardiology"
    NEUROLOGY = "Neurology"
    ORTHOPEDICS = "Orthopedics"
    PEDIATRICS = "Pediatrics"
    GENERAL = "General"
    EMERGENCY = "Emergency"

class AppointmentStatus(enum.Enum):
    SCHEDULED = "Scheduled"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class Doctor(Base):
    __tablename__ = "doctors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department = Column(Enum(DepartmentType), nullable=False)
    avg_consultation_time = Column(Integer, default=20)
    start_time = Column(String, default="09:00")
    end_time = Column(String, default="17:00")
    is_available = Column(Boolean, default=True)
    
    appointments = relationship("Appointment", back_populates="doctor")

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    phone = Column(String)
    is_emergency = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    appointments = relationship("Appointment", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    department = Column(Enum(DepartmentType), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    actual_start_time = Column(DateTime, nullable=True)
    actual_end_time = Column(DateTime, nullable=True)
    estimated_duration = Column(Integer, default=20)
    predicted_wait_time = Column(Float, default=0.0)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.SCHEDULED)
    is_emergency = Column(Boolean, default=False)
    queue_position = Column(Integer, nullable=True)
    
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")

class QueueMetrics(Base):
    __tablename__ = "queue_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total_patients = Column(Integer)
    avg_wait_time = Column(Float)
    avg_consultation_time = Column(Float)
    doctor_utilization = Column(Float)
    department = Column(Enum(DepartmentType))

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.connection import SessionLocal, engine, Base
from app.models.models import Doctor, Patient, Appointment, DepartmentType, AppointmentStatus
from datetime import datetime, timedelta
import random

def seed_database():
    """Generate realistic seed data for the hospital system"""
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Clear existing data
    db.query(Appointment).delete()
    db.query(Patient).delete()
    db.query(Doctor).delete()
    db.commit()
    
    print("Seeding doctors...")
    doctors_data = [
        {"name": "Dr. Sarah Johnson", "department": DepartmentType.CARDIOLOGY, "avg_consultation_time": 25},
        {"name": "Dr. Michael Chen", "department": DepartmentType.CARDIOLOGY, "avg_consultation_time": 22},
        {"name": "Dr. Emily Rodriguez", "department": DepartmentType.NEUROLOGY, "avg_consultation_time": 30},
        {"name": "Dr. James Wilson", "department": DepartmentType.NEUROLOGY, "avg_consultation_time": 28},
        {"name": "Dr. Lisa Anderson", "department": DepartmentType.ORTHOPEDICS, "avg_consultation_time": 20},
        {"name": "Dr. Robert Taylor", "department": DepartmentType.ORTHOPEDICS, "avg_consultation_time": 18},
        {"name": "Dr. Maria Garcia", "department": DepartmentType.PEDIATRICS, "avg_consultation_time": 15},
        {"name": "Dr. David Lee", "department": DepartmentType.PEDIATRICS, "avg_consultation_time": 17},
        {"name": "Dr. Jennifer Brown", "department": DepartmentType.GENERAL, "avg_consultation_time": 20},
        {"name": "Dr. William Martinez", "department": DepartmentType.GENERAL, "avg_consultation_time": 18},
        {"name": "Dr. Amanda White", "department": DepartmentType.EMERGENCY, "avg_consultation_time": 15},
        {"name": "Dr. Christopher Davis", "department": DepartmentType.EMERGENCY, "avg_consultation_time": 12},
    ]
    
    doctors = []
    for doc_data in doctors_data:
        doctor = Doctor(**doc_data)
        db.add(doctor)
        doctors.append(doctor)
    
    db.commit()
    print(f"Created {len(doctors)} doctors")
    
    print("Seeding patients...")
    first_names = ["John", "Emma", "Michael", "Sophia", "William", "Olivia", "James", "Ava", "Robert", "Isabella",
                   "David", "Mia", "Richard", "Charlotte", "Joseph", "Amelia", "Thomas", "Harper", "Charles", "Evelyn"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
    
    patients = []
    for i in range(50):
        patient = Patient(
            name=f"{random.choice(first_names)} {random.choice(last_names)}",
            age=random.randint(1, 85),
            phone=f"+1-555-{random.randint(1000, 9999)}",
            is_emergency=random.random() < 0.1
        )
        db.add(patient)
        patients.append(patient)
    
    db.commit()
    print(f"Created {len(patients)} patients")
    
    print("Seeding appointments...")
    from datetime import datetime, timedelta
    now = datetime.now()
    today_start = now.replace(hour=9, minute=0, second=0, microsecond=0)
    
    appointments = []
    # Create more appointments for TODAY specifically
    for i in range(150):
        doctor = random.choice(doctors)
        patient = random.choice(patients)
        
        # 70% today, 30% next 3 days
        if random.random() < 0.7:
            day_offset = 0
        else:
            day_offset = random.randint(1, 3)
            
        hour_offset = random.randint(0, 7)
        minute_offset = random.choice([0, 15, 30, 45])
        
        scheduled_time = today_start + timedelta(days=day_offset, hours=hour_offset, minutes=minute_offset)
        
        is_emergency = patient.is_emergency or random.random() < 0.08
        
        appointment = Appointment(
            patient_id=patient.id,
            doctor_id=doctor.id,
            department=doctor.department,
            scheduled_time=scheduled_time,
            estimated_duration=doctor.avg_consultation_time,
            is_emergency=is_emergency,
            status=AppointmentStatus.SCHEDULED
        )
        db.add(appointment)
        appointments.append(appointment)
    
    db.commit()
    print(f"Created {len(appointments)} appointments")
    
    # Predict wait times for all appointments
    print("\nCalculating AI wait time predictions...")
    from app.services.ai_service import ai_service
    for apt in appointments:
        try:
            ai_service.predict_wait_time(db, apt.id)
        except Exception as e:
            print(f"Failed to predict wait time for appointment {apt.id}: {e}")
    
    print("\n✅ Database seeded successfully!")
    print(f"   - {len(doctors)} doctors")
    print(f"   - {len(patients)} patients")
    print(f"   - {len(appointments)} appointments")
    
    db.close()

if __name__ == "__main__":
    seed_database()

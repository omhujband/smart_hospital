from datetime import datetime, timedelta
from app.database.connection import SessionLocal
from app.models.models import Doctor, Patient, Appointment, DepartmentType, AppointmentStatus, User, UserRole
from app.services.auth import get_password_hash

def seed_database():
    db = SessionLocal()

    print("⏳ Seeding cloud database...")

    # 1. Create Doctors
    doc1 = Doctor(name="Dr. Sarah Connor", department=DepartmentType.EMERGENCY, avg_consultation_time=15)
    doc2 = Doctor(name="Dr. Gregory House", department=DepartmentType.GENERAL, avg_consultation_time=20)
    db.add_all([doc1, doc2])
    db.commit()
    db.refresh(doc1)
    db.refresh(doc2)
    print("✅ Doctors created!")

    # 2. Create Login Accounts for the Doctors
    user1 = User(username="sconnor", hashed_password=get_password_hash("password123"), role=UserRole.DOCTOR, doctor_id=doc1.id)
    user2 = User(username="ghouse", hashed_password=get_password_hash("password123"), role=UserRole.DOCTOR, doctor_id=doc2.id)
    db.add_all([user1, user2])
    db.commit()
    print("✅ Doctor Login accounts created!")

    # 3. Create Patients
    p1 = Patient(name="John Doe", age=45, phone="555-0101", is_emergency=True)
    p2 = Patient(name="Jane Smith", age=28, phone="555-0102", is_emergency=False)
    db.add_all([p1, p2])
    db.commit()
    db.refresh(p1)
    db.refresh(p2)
    print("✅ Patients created!")

    # 4. Schedule an Appointment
    app1 = Appointment(
        patient_id=p1.id,
        doctor_id=doc1.id,
        department=DepartmentType.EMERGENCY,
        scheduled_time=datetime.now() + timedelta(minutes=15),
        status=AppointmentStatus.SCHEDULED,
        estimated_duration=doc1.avg_consultation_time,
        is_emergency=True
    )
    db.add(app1)
    db.commit()
    print("✅ Appointments created!")

    print("🎉 Database successfully seeded!")
    db.close()

if __name__ == "__main__":
    seed_database()
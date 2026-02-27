import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.connection import SessionLocal
from app.models.models import Doctor, Patient, Appointment

db = SessionLocal()

doctors = db.query(Doctor).all()
patients = db.query(Patient).all()
appointments = db.query(Appointment).all()

print(f"\n=== Database Status ===")
print(f"Doctors: {len(doctors)}")
print(f"Patients: {len(patients)}")
print(f"Appointments: {len(appointments)}")
print(f"Scheduled Appointments: {len([a for a in appointments if a.status.value == 'Scheduled'])}")

if len(appointments) > 0:
    print(f"\nSample appointment:")
    apt = appointments[0]
    print(f"  ID: {apt.id}")
    print(f"  Patient: {apt.patient_id}")
    print(f"  Doctor: {apt.doctor_id}")
    print(f"  Status: {apt.status.value}")
    print(f"  Time: {apt.scheduled_time}")

db.close()

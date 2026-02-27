import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.connection import SessionLocal
from app.models.models import Appointment

db = SessionLocal()
appointments = db.query(Appointment).all()

print(f"\nTotal appointments: {len(appointments)}")
if len(appointments) > 0:
    print(f"\nFirst 5 appointments:")
    for apt in appointments[:5]:
        print(f"  ID: {apt.id}, Status: {apt.status}, Time: {apt.scheduled_time}")
    
    statuses = {}
    for apt in appointments:
        status = str(apt.status.value) if hasattr(apt.status, 'value') else str(apt.status)
        statuses[status] = statuses.get(status, 0) + 1
    
    print(f"\nStatus breakdown:")
    for status, count in statuses.items():
        print(f"  {status}: {count}")

db.close()

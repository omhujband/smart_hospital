from app.ml.wait_time_predictor import WaitTimePredictor
from app.ml.appointment_optimizer import AppointmentOptimizer
from sqlalchemy.orm import Session
from app.models.models import Appointment, Doctor, Patient, AppointmentStatus
from datetime import datetime, timedelta
import os

class AIService:
    def __init__(self):
        self.predictor = WaitTimePredictor()
        self.optimizer = AppointmentOptimizer()
        self._load_or_train_model()
    
    def _load_or_train_model(self):
        """Load existing model or train new one"""
        model_path = 'app/ml/models'
        try:
            if os.path.exists(f'{model_path}/wait_time_model.pkl'):
                self.predictor.load_model(model_path)
            else:
                print("Training new model...")
                self.predictor.train()
                self.predictor.save_model(model_path)
        except Exception as e:
            print(f"Model loading failed, training new model: {e}")
            self.predictor.train()
            self.predictor.save_model(model_path)
    
    def predict_wait_time(self, db: Session, appointment_id: int) -> float:
        """Predict wait time for a specific appointment"""
        
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            return 0.0
        
        doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
        
        # Count patients before this appointment
        patients_before = db.query(Appointment).filter(
            Appointment.doctor_id == appointment.doctor_id,
            Appointment.scheduled_time < appointment.scheduled_time,
            Appointment.status == AppointmentStatus.SCHEDULED
        ).count()
        
        # Count current queue length
        queue_length = db.query(Appointment).filter(
            Appointment.doctor_id == appointment.doctor_id,
            Appointment.status == AppointmentStatus.SCHEDULED
        ).count()
        
        # Calculate doctor utilization
        total_appointments_today = db.query(Appointment).filter(
            Appointment.doctor_id == appointment.doctor_id,
            Appointment.scheduled_time >= datetime.now().replace(hour=0, minute=0, second=0)
        ).count()
        
        working_hours = 8  # Assume 8 hour workday
        max_appointments = (working_hours * 60) / doctor.avg_consultation_time
        doctor_utilization = min(total_appointments_today / max_appointments, 1.0) if max_appointments > 0 else 0.5
        
        # Prepare features
        features = {
            'hour_of_day': appointment.scheduled_time.hour,
            'day_of_week': appointment.scheduled_time.weekday(),
            'queue_length': queue_length,
            'doctor_avg_time': doctor.avg_consultation_time,
            'is_emergency': 1 if appointment.is_emergency else 0,
            'department': appointment.department.value,
            'patients_before': patients_before,
            'doctor_utilization': doctor_utilization
        }
        
        # Predict
        predicted_wait = self.predictor.predict(features)
        
        # Update appointment
        appointment.predicted_wait_time = predicted_wait
        appointment.queue_position = patients_before + 1
        db.commit()
        
        return predicted_wait
    
    def optimize_appointments(self, db: Session, doctor_id: int = None, department: str = None):
        """Optimize appointment schedule for doctor or department"""
        
        query = db.query(Appointment).filter(Appointment.status == AppointmentStatus.SCHEDULED)
        
        if doctor_id:
            query = query.filter(Appointment.doctor_id == doctor_id)
        elif department:
            query = query.filter(Appointment.department == department)
        
        appointments = query.all()
        
        # Get relevant doctors
        doctor_query = db.query(Doctor).filter(Doctor.is_available == True)
        if doctor_id:
            doctor_query = doctor_query.filter(Doctor.id == doctor_id)
        elif department:
            doctor_query = doctor_query.filter(Doctor.department == department)
        
        doctors = doctor_query.all()
        
        # Convert to dict format
        apt_dicts = [
            {
                'id': apt.id,
                'doctor_id': apt.doctor_id,
                'scheduled_time': apt.scheduled_time,
                'estimated_duration': apt.estimated_duration,
                'is_emergency': apt.is_emergency,
                'status': apt.status.value
            }
            for apt in appointments
        ]
        
        doctor_dicts = [
            {
                'id': doc.id,
                'start_time': doc.start_time,
                'end_time': doc.end_time,
                'avg_consultation_time': doc.avg_consultation_time
            }
            for doc in doctors
        ]
        
        # Optimize
        result = self.optimizer.optimize_schedule(apt_dicts, doctor_dicts)
        
        # Update database with optimized values
        for opt_apt in result['optimized_appointments']:
            appointment = db.query(Appointment).filter(Appointment.id == opt_apt['id']).first()
            if appointment:
                appointment.predicted_wait_time = opt_apt['predicted_wait_time']
                appointment.queue_position = opt_apt['queue_position']
        
        db.commit()
        
        return result
    
    def real_time_reoptimize(self, db: Session):
        """Real-time optimization triggered by new arrivals or delays"""
        
        current_time = datetime.now()
        
        # Get all scheduled appointments
        appointments = db.query(Appointment).filter(
            Appointment.status == AppointmentStatus.SCHEDULED
        ).all()
        
        doctors = db.query(Doctor).filter(Doctor.is_available == True).all()
        
        apt_dicts = [
            {
                'id': apt.id,
                'doctor_id': apt.doctor_id,
                'scheduled_time': apt.scheduled_time,
                'estimated_duration': apt.estimated_duration,
                'is_emergency': apt.is_emergency,
                'status': apt.status.value
            }
            for apt in appointments
        ]
        
        doctor_dicts = [
            {
                'id': doc.id,
                'start_time': doc.start_time,
                'end_time': doc.end_time,
                'avg_consultation_time': doc.avg_consultation_time
            }
            for doc in doctors
        ]
        
        result = self.optimizer.dynamic_reoptimize(apt_dicts, doctor_dicts, current_time)
        
        # Update appointments
        for opt_apt in result['optimized_appointments']:
            appointment = db.query(Appointment).filter(Appointment.id == opt_apt['id']).first()
            if appointment:
                appointment.predicted_wait_time = opt_apt['predicted_wait_time']
                appointment.queue_position = opt_apt['queue_position']
        
        db.commit()
        
        return result

# Global instance
ai_service = AIService()

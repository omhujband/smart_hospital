from datetime import datetime, timedelta
from typing import List, Dict
import numpy as np

class AppointmentOptimizer:
    def __init__(self):
        self.emergency_priority_boost = 1000
        
    def optimize_schedule(self, appointments: List[Dict], doctors: List[Dict]) -> Dict:
        """
        Optimize appointment scheduling using constraint-based greedy algorithm
        Minimizes: avg wait time + doctor idle time
        Constraints: doctor hours, emergency priority, appointment duration
        """
        
        # Sort appointments: emergencies first, then by arrival time
        sorted_appointments = sorted(
            appointments,
            key=lambda x: (-x['is_emergency'] * self.emergency_priority_boost, x['scheduled_time'])
        )
        
        # Initialize doctor schedules
        doctor_schedules = {}
        for doc in doctors:
            start_time_obj = self._parse_time(doc['start_time'])
            end_time_obj = self._parse_time(doc['end_time'])
            today = datetime.now().date()
            doctor_schedules[doc['id']] = {
                'appointments': [],
                'current_time': datetime.combine(today, start_time_obj),
                'end_time': datetime.combine(today, end_time_obj),
                'total_time': 0,
                'idle_time': 0
            }
        
        optimized_appointments = []
        
        for apt in sorted_appointments:
            doctor_id = apt['doctor_id']
            
            if doctor_id not in doctor_schedules:
                continue
            
            schedule = doctor_schedules[doctor_id]
            
            # Calculate optimal start time
            requested_time = apt['scheduled_time']
            current_time = schedule['current_time']
            
            # Start time is max of requested time and current available time
            if requested_time > current_time:
                # Doctor has idle time
                idle_gap = (requested_time - current_time).total_seconds() / 60
                schedule['idle_time'] += idle_gap
                start_time = requested_time
            else:
                start_time = current_time
            
            duration = apt.get('estimated_duration', 20)
            end_time = start_time + timedelta(minutes=duration)
            
            # Check if within doctor's working hours
            if end_time > schedule['end_time']:
                # Reschedule to next available slot or skip
                continue
            
            # Calculate wait time
            wait_time = max(0, (start_time - requested_time).total_seconds() / 60)
            
            # Calculate queue position
            queue_position = len(schedule['appointments']) + 1
            
            optimized_apt = {
                **apt,
                'optimized_start_time': start_time,
                'optimized_end_time': end_time,
                'predicted_wait_time': wait_time,
                'queue_position': queue_position
            }
            
            optimized_appointments.append(optimized_apt)
            schedule['appointments'].append(optimized_apt)
            schedule['current_time'] = end_time
            schedule['total_time'] += duration
        
        # Calculate metrics
        total_wait_time = sum(apt['predicted_wait_time'] for apt in optimized_appointments)
        avg_wait_time = total_wait_time / len(optimized_appointments) if optimized_appointments else 0
        
        total_idle_time = sum(s['idle_time'] for s in doctor_schedules.values())
        total_working_time = sum(s['total_time'] for s in doctor_schedules.values())
        
        doctor_utilization = (total_working_time / (total_working_time + total_idle_time) * 100) if (total_working_time + total_idle_time) > 0 else 0
        
        return {
            'optimized_appointments': optimized_appointments,
            'avg_wait_time': avg_wait_time,
            'doctor_utilization': doctor_utilization,
            'total_appointments': len(optimized_appointments),
            'doctor_schedules': doctor_schedules
        }
    
    def dynamic_reoptimize(self, current_queue: List[Dict], doctors: List[Dict], current_time: datetime) -> Dict:
        """
        Real-time re-optimization when new patients arrive or delays occur
        """
        
        # Filter only pending appointments
        pending = [apt for apt in current_queue if apt.get('status') == 'Scheduled']
        
        # Update scheduled times to current time for immediate processing
        for apt in pending:
            if apt['scheduled_time'] < current_time:
                apt['scheduled_time'] = current_time
        
        return self.optimize_schedule(pending, doctors)
    
    def calculate_optimal_slot(self, doctor_schedule: List[Dict], requested_time: datetime, duration: int) -> datetime:
        """
        Find optimal time slot for a new appointment
        """
        
        if not doctor_schedule:
            return requested_time
        
        # Sort existing appointments
        sorted_schedule = sorted(doctor_schedule, key=lambda x: x['scheduled_time'])
        
        # Try to fit in requested time
        for i, apt in enumerate(sorted_schedule):
            if requested_time + timedelta(minutes=duration) <= apt['scheduled_time']:
                return requested_time
            
            # Try gap between appointments
            if i < len(sorted_schedule) - 1:
                gap_start = apt['scheduled_time'] + timedelta(minutes=apt['estimated_duration'])
                gap_end = sorted_schedule[i + 1]['scheduled_time']
                
                if gap_end - gap_start >= timedelta(minutes=duration):
                    return max(requested_time, gap_start)
        
        # Schedule after last appointment
        last_apt = sorted_schedule[-1]
        return max(
            requested_time,
            last_apt['scheduled_time'] + timedelta(minutes=last_apt['estimated_duration'])
        )
    
    def _parse_time(self, time_str: str):
        """Parse time string to time object"""
        return datetime.strptime(time_str, "%H:%M").time()

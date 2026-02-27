export enum DepartmentType {
  CARDIOLOGY = "Cardiology",
  NEUROLOGY = "Neurology",
  ORTHOPEDICS = "Orthopedics",
  PEDIATRICS = "Pediatrics",
  GENERAL = "General",
  EMERGENCY = "Emergency"
}

export enum AppointmentStatus {
  SCHEDULED = "Scheduled",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled"
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  phone: string;
  is_emergency: boolean;
  created_at: string;
}

export interface Doctor {
  id: number;
  name: string;
  department: DepartmentType;
  avg_consultation_time: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  department: DepartmentType;
  scheduled_time: string;
  estimated_duration: number;
  predicted_wait_time: number;
  status: AppointmentStatus;
  queue_position?: number;
}

export interface QueueStatus {
  department: DepartmentType;
  total_waiting: number;
  avg_wait_time: number;
  current_patients: Appointment[];
}

export interface AnalyticsSummary {
  total_appointments: number;
  avg_wait_time: number;
  avg_consultation_time: number;
  doctor_utilization: number;
  patients_per_hour: number;
}

export interface OptimizedSchedule {
  doctor_id: number;
  doctor_name: string;
  appointments: Appointment[];
  total_patients: number;
  avg_wait_time: number;
  utilization_rate: number;
}

export interface OSWindow {
  id: string;
  title: string;
  component: string;
  isMinimized: boolean;
  zIndex: number;
}

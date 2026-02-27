import axios from 'axios';
import { Patient, Doctor, Appointment, QueueStatus, AnalyticsSummary, OptimizedSchedule } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const patientAPI = {
  getAll: () => api.get<Patient[]>('/patients/'),
  getById: (id: number) => api.get<Patient>(`/patients/${id}/`),
  create: (data: Partial<Patient>) => api.post<Patient>('/patients/', data),
};

export const doctorAPI = {
  getAll: () => api.get<Doctor[]>('/doctors/'),
  getById: (id: number) => api.get<Doctor>(`/doctors/${id}/`),
  create: (data: Partial<Doctor>) => api.post<Doctor>('/doctors/', data),
  updateAvailability: (id: number, isAvailable: boolean) => 
    api.patch(`/doctors/${id}/availability/`, null, { params: { is_available: isAvailable } }),
};

export const appointmentAPI = {
  getAll: (params?: { status?: string; doctor_id?: number; department?: string }) => {
    console.log('Fetching appointments with params:', params);
    return api.get<Appointment[]>('/appointments/', { params }).then(res => {
      console.log('Appointments response:', res.data);
      return res;
    }).catch(err => {
      console.error('Appointments API error:', err.response?.data || err.message);
      throw err;
    });
  },
  getById: (id: number) => api.get<Appointment>(`/appointments/${id}/`),
  create: (data: Partial<Appointment>) => api.post<Appointment>('/appointments/', data),
  updateStatus: (id: number, status: string) => 
    api.patch(`/appointments/${id}/status/`, null, { params: { status } }),
  predictWait: (id: number) => api.get(`/appointments/${id}/predict-wait/`),
};

export const aiAPI = {
  optimize: (params?: { doctor_id?: number; department?: string }) => 
    api.post('/ai/optimize/', null, { params }),
  reoptimize: () => api.post('/ai/reoptimize/'),
  getQueueStatus: (department: string) => api.get<QueueStatus>(`/ai/queue/${department}/`),
  getAnalytics: () => api.get<AnalyticsSummary>('/ai/analytics/'),
  getDoctorSchedule: (doctorId: number) => api.get<OptimizedSchedule>(`/ai/schedule/${doctorId}/`),
};

export default api;

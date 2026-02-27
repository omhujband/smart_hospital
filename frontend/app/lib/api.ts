import axios from 'axios';
import { Patient, Doctor, Appointment, QueueStatus, AnalyticsSummary, OptimizedSchedule } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. Receptionist Domain: Patients
export const patientAPI = {
    getAll: () => api.get<Patient[]>('/receptionist/patients/'),
    getById: (id: number) => api.get<Patient>(`/receptionist/patients/${id}`),
    create: (data: Partial<Patient>) => api.post<Patient>('/receptionist/patients/', data),
};

// 2. Receptionist Domain: Doctors
export const doctorAPI = {
    getAll: () => api.get<Doctor[]>('/receptionist/doctors/'),
    // Profile lookups & availability updates moved to the Doctor Domain
    getById: (id: number) => api.get<Doctor>(`/doctor/profile/${id}`),
    create: (data: Partial<Doctor>) => api.post<Doctor>('/receptionist/doctors/', data),
    updateAvailability: (id: number, isAvailable: boolean) =>
        api.patch(`/doctor/profile/${id}/availability`, null, { params: { is_available: isAvailable } }),
};

// 3. Receptionist & Doctor Domains: Appointments
export const appointmentAPI = {
    // Global queue is now explicitly handled by the receptionist route
    getAll: (params?: { status?: string; doctor_id?: number; department?: string }) => {
        console.log('Fetching appointments with params:', params);
        return api.get<Appointment[]>('/receptionist/appointments/queue', { params }).then(res => {
            console.log('Appointments response:', res.data);
            return res;
        }).catch(err => {
            console.error('Appointments API error:', err.response?.data || err.message);
            throw err;
        });
    },
    getById: (id: number) => api.get<Appointment>(`/receptionist/appointments/${id}`),
    create: (data: Partial<Appointment>) => api.post<Appointment>('/receptionist/appointments/', data),

    // NOTE: In the segregated backend, a doctor must provide their ID to update status or predict wait.
    // We added doctorId to these function signatures.
    updateStatus: (doctorId: number, appointmentId: number, status: string) =>
        api.patch(`/doctor/consultations/${doctorId}/appointments/${appointmentId}/status`, null, { params: { status } }),
    predictWait: (doctorId: number, appointmentId: number) =>
        api.get(`/doctor/consultations/${doctorId}/appointments/${appointmentId}/predict-wait`),
};

// 4. Shared Domain: AI
export const aiAPI = {
    optimize: (params?: { doctor_id?: number; department?: string }) =>
        api.post('/ai/optimize/', null, { params }),
    reoptimize: () => api.post('/ai/reoptimize/'),
    getQueueStatus: (department: string) => api.get<QueueStatus>(`/ai/queue/${department}/`),
    getAnalytics: () => api.get<AnalyticsSummary>('/ai/analytics/'),
    getDoctorSchedule: (doctorId: number) => api.get<OptimizedSchedule>(`/ai/schedule/${doctorId}/`),
};

export default api;
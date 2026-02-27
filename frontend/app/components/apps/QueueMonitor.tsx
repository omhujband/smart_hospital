'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { appointmentAPI, doctorAPI } from '@/app/lib/api';
import { Appointment, Doctor } from '@/app/types';
import { Clock, User, AlertCircle } from 'lucide-react';

export default function QueueMonitor() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [aptsRes, docsRes] = await Promise.all([
        appointmentAPI.getAll({ status: 'Scheduled' }),
        doctorAPI.getAll()
      ]);
      console.log('Appointments:', aptsRes.data);
      console.log('Doctors:', docsRes.data);
      setAppointments(aptsRes.data);
      setDoctors(docsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDoctorName = (doctorId: number) => {
    return doctors.find(d => d.id === doctorId)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-os-neon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Live Patient Queue</h2>
        <div className="bg-os-neon/20 px-4 py-2 rounded-lg">
          <span className="text-os-neon font-semibold">{appointments.length} Waiting</span>
        </div>
      </div>

      <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2">
        {appointments.length === 0 ? (
          <div className="text-center text-white/50 py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No patients in queue</p>
          </div>
        ) : (
          appointments.map((apt, index) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gradient-to-r ${
                apt.is_emergency 
                  ? 'from-red-500/20 to-red-600/10 border-red-500/50' 
                  : 'from-os-cyan/10 to-os-blue/10 border-os-cyan/30'
              } border rounded-xl p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${
                    apt.is_emergency ? 'bg-red-500/30' : 'bg-os-cyan/30'
                  } flex items-center justify-center`}>
                    <span className="text-white font-bold">#{apt.queue_position || index + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-os-cyan" />
                      <span className="text-white font-semibold">Patient #{apt.patient_id}</span>
                      {apt.is_emergency && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">EMERGENCY</span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm mt-1">
                      Dr. {getDoctorName(apt.doctor_id)} • {apt.department}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-os-neon">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{Math.round(apt.predicted_wait_time)} min</span>
                  </div>
                  <p className="text-white/50 text-xs mt-1">
                    {new Date(apt.scheduled_time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

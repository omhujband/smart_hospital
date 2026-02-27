'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { doctorAPI, appointmentAPI, aiAPI } from '@/app/lib/api';
import { Doctor, Appointment } from '@/app/types';
import { Calendar, RefreshCw, Zap } from 'lucide-react';

export default function Scheduler() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchAppointments();
    }
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const res = await doctorAPI.getAll();
      setDoctors(res.data);
      if (res.data.length > 0) {
        setSelectedDoctor(res.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    if (!selectedDoctor) return;
    try {
      const res = await appointmentAPI.getAll({ doctor_id: selectedDoctor, status: 'Scheduled' });
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      await aiAPI.optimize({ doctor_id: selectedDoctor || undefined });
      await fetchAppointments();
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Appointment Scheduler</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOptimize}
          disabled={optimizing}
          className="bg-gradient-to-r from-os-cyan to-os-neon text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {optimizing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          AI Optimize
        </motion.button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {doctors.map(doctor => (
          <motion.button
            key={doctor.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedDoctor(doctor.id)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedDoctor === doctor.id
                ? 'bg-os-neon text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {doctor.name}
          </motion.button>
        ))}
      </div>

      {selectedDoctorData && (
        <div className="bg-os-blue/20 border border-os-cyan/30 rounded-xl p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-white/60 text-sm">Department</p>
              <p className="text-white font-semibold">{selectedDoctorData.department}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Avg Time</p>
              <p className="text-os-neon font-semibold">{selectedDoctorData.avg_consultation_time} min</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Working Hours</p>
              <p className="text-white font-semibold">{selectedDoctorData.start_time} - {selectedDoctorData.end_time}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Appointments</p>
              <p className="text-os-cyan font-semibold">{appointments.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {appointments.length === 0 ? (
          <div className="text-center text-white/50 py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No scheduled appointments</p>
          </div>
        ) : (
          appointments.map((apt, index) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-gradient-to-r from-os-cyan/10 to-os-blue/10 border border-os-cyan/30 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-os-cyan/30 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">#{apt.queue_position || index + 1}</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Patient #{apt.patient_id}</p>
                  <p className="text-white/60 text-sm">{apt.department}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-os-neon font-semibold">
                  {new Date(apt.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-white/50 text-xs">Wait: {Math.round(apt.predicted_wait_time)} min</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

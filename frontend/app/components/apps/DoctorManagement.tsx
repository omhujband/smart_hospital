'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { doctorAPI } from '@/app/lib/api';
import { Doctor } from '@/app/types';
import { Stethoscope, CheckCircle, XCircle } from 'lucide-react';

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await doctorAPI.getAll();
      setDoctors(res.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (doctorId: number, currentStatus: boolean) => {
    try {
      await doctorAPI.updateAvailability(doctorId, !currentStatus);
      await fetchDoctors();
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
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
      <div className="flex items-center gap-3">
        <Stethoscope className="w-8 h-8 text-os-neon" />
        <h2 className="text-2xl font-bold text-white">Doctor Management</h2>
      </div>

      <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2">
        {doctors.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gradient-to-r from-os-cyan/10 to-os-blue/10 border border-os-cyan/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full ${
                  doctor.is_available ? 'bg-green-500/30' : 'bg-red-500/30'
                } flex items-center justify-center`}>
                  <Stethoscope className={`w-7 h-7 ${
                    doctor.is_available ? 'text-green-400' : 'text-red-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{doctor.name}</h3>
                  <p className="text-white/60 text-sm">{doctor.department}</p>
                  <p className="text-white/50 text-xs mt-1">
                    {doctor.start_time} - {doctor.end_time} • Avg: {doctor.avg_consultation_time} min
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleAvailability(doctor.id, doctor.is_available)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  doctor.is_available
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
              >
                {doctor.is_available ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Available
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Unavailable
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

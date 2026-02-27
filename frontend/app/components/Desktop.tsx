'use client';

import { motion } from 'framer-motion';
import { useOSStore } from '../store/osStore';
import { Activity, Calendar, Brain, BarChart3, Users, Stethoscope, LogOut } from 'lucide-react';

const apps = [
  { id: 'queue', title: 'Patient Queue', icon: Users, component: 'QueueMonitor' },
  { id: 'scheduler', title: 'Appointment Scheduler', icon: Calendar, component: 'Scheduler' },
  { id: 'ai', title: 'AI Prediction', icon: Brain, component: 'AIPrediction' },
  { id: 'analytics', title: 'Analytics Dashboard', icon: BarChart3, component: 'Analytics' },
  { id: 'doctors', title: 'Doctor Management', icon: Stethoscope, component: 'DoctorManagement' },
];

export default function Desktop() {
  const { username, logout, openWindow } = useOSStore();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-os-dark via-os-blue to-os-dark">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-black/30 backdrop-blur-md border-b border-os-neon/20 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-os-neon" />
          <span className="text-white font-semibold">Hospital Queue OS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/70 text-sm">{username}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            className="text-os-cyan hover:text-os-neon transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Desktop Area */}
      <div className="pt-12 h-screen overflow-hidden">
        {/* Desktop content will be rendered here by WindowManager */}
      </div>

      {/* Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-xl border border-os-neon/30 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-2xl"
        >
          {apps.map((app, index) => (
            <motion.button
              key={app.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.2, y: -10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => openWindow(app.title, app.component)}
              className="relative group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-os-cyan/20 to-os-neon/20 rounded-xl flex items-center justify-center border border-os-cyan/30 hover:border-os-neon transition-all hover:shadow-lg hover:shadow-os-neon/50">
                <app.icon className="w-7 h-7 text-os-neon" />
              </div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {app.title}
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

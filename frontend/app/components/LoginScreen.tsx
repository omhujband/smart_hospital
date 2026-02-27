'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '../store/osStore';
import { Activity, Lock, UserCircle, Stethoscope } from 'lucide-react';

export default function LoginScreen() {
  const [recUsername, setRecUsername] = useState('');
  const [recPassword, setRecPassword] = useState('');
  const [docUsername, setDocUsername] = useState('');
  const [docPassword, setDocPassword] = useState('');

  const login = useOSStore(state => state.login);

  const handleRecLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (recUsername) {
      login(recUsername);
    }
  };

  const handleDocLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (docUsername) {
      login(docUsername);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-os-dark via-os-blue to-os-dark flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={{ rotate: 0 }}
            transition={{ ease: "linear" }}
            className="mb-4"
          >
            <Activity className="w-16 h-16 text-os-neon" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 text-center drop-shadow-md">NIRAMAYA</h1>
          <p className="text-os-cyan text-sm md:text-base text-center">Smart Appointment Management System</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-5xl">
          {/* Receptionist Card */}
          <div className="bg-os-glass backdrop-blur-os border border-os-cyan/30 rounded-2xl p-8 w-80 md:w-96 shadow-2xl hover:shadow-os-shadow-glow hover:bg-os-hover transition-all duration-300">
            <div className="flex flex-col items-center mb-6">
              <UserCircle className="w-12 h-12 text-os-cyan mb-3" />
              <h2 className="text-2xl font-bold text-white tracking-wide">Receptionist</h2>
              <p className="text-os-cyan/70 text-sm mt-1">Manage Queue & Appointments</p>
            </div>

            <form onSubmit={handleRecLogin} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2 font-medium">Username</label>
                <input
                  type="text"
                  value={recUsername}
                  onChange={(e) => setRecUsername(e.target.value)}
                  className="w-full bg-os-dark/60 border border-os-cyan/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-os-cyan focus:shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2 font-medium">Password</label>
                <input
                  type="password"
                  value={recPassword}
                  onChange={(e) => setRecPassword(e.target.value)}
                  className="w-full bg-os-dark/60 border border-os-cyan/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-os-cyan focus:shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-os-blue to-os-cyan text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 mt-6 hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all"
              >
                <Lock className="w-5 h-5" />
                Login as Receptionist
              </motion.button>
            </form>
          </div>

          {/* Doctor Card */}
          <div className="bg-os-glass backdrop-blur-os border border-os-neon/30 rounded-2xl p-8 w-80 md:w-96 shadow-xl hover:shadow-os-shadow-glow hover:bg-os-hover transition-all duration-300">
            <div className="flex flex-col items-center mb-6">
              <Stethoscope className="w-12 h-12 text-os-neon mb-3" />
              <h2 className="text-2xl font-bold text-white tracking-wide">Doctor</h2>
              <p className="text-os-neon/70 text-sm mt-1">Consultation & Patient Care</p>
            </div>

            <form onSubmit={handleDocLogin} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2 font-medium">Username</label>
                <input
                  type="text"
                  value={docUsername}
                  onChange={(e) => setDocUsername(e.target.value)}
                  className="w-full bg-os-dark/60 border border-os-neon/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-os-neon focus:shadow-[0_0_10px_rgba(0,217,255,0.4)] transition-all"
                  placeholder="dr_smith"
                  required
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2 font-medium">Password</label>
                <input
                  type="password"
                  value={docPassword}
                  onChange={(e) => setDocPassword(e.target.value)}
                  className="w-full bg-os-dark/60 border border-os-neon/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-os-neon focus:shadow-[0_0_10px_rgba(0,217,255,0.4)] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-os-cyan to-os-neon text-os-dark font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-6 hover:shadow-[0_0_15px_rgba(0,217,255,0.8)] transition-all"
              >
                <Lock className="w-5 h-5" />
                Login as Doctor
              </motion.button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center text-white/40 text-sm w-full">
          <p>Healthcare Command Center v1.0</p>
          <p className="mt-1 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" /> Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}

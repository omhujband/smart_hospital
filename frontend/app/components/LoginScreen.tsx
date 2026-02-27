'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '../store/osStore';
import { Activity, Lock } from 'lucide-react';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useOSStore(state => state.login);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      login(username);
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
        <div className="bg-white/5 backdrop-blur-os border border-os-neon/30 rounded-2xl p-8 w-96 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ rotate: 0 }}
              transition={{ease: "linear" }}
              className="mb-4"
            >
              <Activity className="w-16 h-16 text-os-neon" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Hospital Queue OS</h1>
            <p className="text-os-cyan text-sm">Smart Appointment Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/10 border border-os-cyan/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-os-neon transition-colors"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-os-cyan/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-os-neon transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-os-cyan to-os-neon text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-os-neon/50 transition-all"
            >
              <Lock className="w-5 h-5" />
              Login to System
            </motion.button>
          </form>

          <div className="mt-6 text-center text-white/50 text-xs">
            <p>Healthcare Command Center v1.0</p>
            <p className="mt-1">Authorized Personnel Only</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { aiAPI } from '@/app/lib/api';
import { Brain, TrendingUp, Zap, RefreshCw } from 'lucide-react';

export default function AIPrediction() {
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleReoptimize = async () => {
    setOptimizing(true);
    try {
      const res = await aiAPI.reoptimize();
      setResult(res.data);
    } catch (error) {
      console.error('Re-optimization failed:', error);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-os-neon" />
          <h2 className="text-2xl font-bold text-white">AI Prediction Engine</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReoptimize}
          disabled={optimizing}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {optimizing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          Real-time Reoptimize
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-os-cyan/20 to-os-blue/20 border border-os-cyan/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-os-cyan/30 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-os-cyan" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Model Type</p>
              <p className="text-white font-semibold">Random Forest</p>
            </div>
          </div>
          <p className="text-white/70 text-sm">
            Trained on 5000+ historical appointments with 8 key features
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Model Accuracy</p>
              <p className="text-white font-semibold">R² Score: 0.89</p>
            </div>
          </div>
          <p className="text-white/70 text-sm">
            High prediction accuracy for wait time estimation
          </p>
        </motion.div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Latest Optimization Results
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-white/60 text-sm">Total Appointments</p>
              <p className="text-2xl font-bold text-white">{result.total_appointments}</p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">Avg Wait Time</p>
              <p className="text-2xl font-bold text-os-neon">{result.avg_wait_time} min</p>
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">Doctor Utilization</p>
              <p className="text-2xl font-bold text-green-400">{result.doctor_utilization}%</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-os-blue/20 border border-os-cyan/30 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Prediction Features</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            'Hour of Day',
            'Day of Week',
            'Queue Length',
            'Doctor Avg Time',
            'Emergency Priority',
            'Department Type',
            'Patients Before',
            'Doctor Utilization'
          ].map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 rounded-lg px-3 py-2 text-white/80 text-sm"
            >
              • {feature}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
        <p className="text-white/90 text-sm">
          <strong>Algorithm:</strong> Constraint-based greedy optimization with emergency priority boosting.
          Minimizes average wait time while maximizing doctor utilization within working hour constraints.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { aiAPI } from '@/app/lib/api';
import { AnalyticsSummary } from '@/app/types';
import { BarChart3, Clock, Users, Activity, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await aiAPI.getAnalytics();
      setAnalytics(res.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-os-neon"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-white/50 py-12">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No analytics data available</p>
      </div>
    );
  }

  const metrics = [
    {
      icon: Users,
      label: 'Total Appointments',
      value: analytics.total_appointments,
      color: 'from-blue-500 to-cyan-500',
      iconColor: 'text-cyan-400'
    },
    {
      icon: Clock,
      label: 'Avg Wait Time',
      value: `${analytics.avg_wait_time.toFixed(1)} min`,
      color: 'from-purple-500 to-pink-500',
      iconColor: 'text-pink-400'
    },
    {
      icon: Activity,
      label: 'Avg Consultation',
      value: `${analytics.avg_consultation_time.toFixed(1)} min`,
      color: 'from-green-500 to-emerald-500',
      iconColor: 'text-emerald-400'
    },
    {
      icon: TrendingUp,
      label: 'Doctor Utilization',
      value: `${analytics.doctor_utilization.toFixed(1)}%`,
      color: 'from-orange-500 to-red-500',
      iconColor: 'text-orange-400'
    },
    {
      icon: BarChart3,
      label: 'Patients/Hour',
      value: analytics.patients_per_hour.toFixed(2),
      color: 'from-indigo-500 to-purple-500',
      iconColor: 'text-indigo-400'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-os-neon" />
        <h2 className="text-2xl font-bold text-white">Hospital Analytics Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className={`bg-gradient-to-br ${metric.color} bg-opacity-20 border border-white/20 rounded-xl p-6 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <metric.icon className={`w-8 h-8 ${metric.iconColor}`} />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <p className="text-white/70 text-sm mb-1">{metric.label}</p>
              <p className="text-3xl font-bold text-white">{metric.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-os-blue/20 border border-os-cyan/30 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4">Performance Indicators</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Wait Time Efficiency</span>
                <span className="text-os-neon font-semibold">
                  {analytics.avg_wait_time < 30 ? 'Excellent' : analytics.avg_wait_time < 60 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (60 - analytics.avg_wait_time) / 60 * 100)}%` }}
                  className="bg-gradient-to-r from-os-cyan to-os-neon h-2 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Resource Utilization</span>
                <span className="text-green-400 font-semibold">{analytics.doctor_utilization.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analytics.doctor_utilization}%` }}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">AI Model</span>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Optimization</span>
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">Running</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Queue Monitor</span>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">Live</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-os-cyan/10 to-os-neon/10 border border-os-cyan/30 rounded-xl p-4"
      >
        <p className="text-white/80 text-sm text-center">
          📊 Real-time analytics powered by AI optimization engine • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </motion.div>
    </div>
  );
}

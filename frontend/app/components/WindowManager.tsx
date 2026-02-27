'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '../store/osStore';
import { X, Minus } from 'lucide-react';
import { useState } from 'react';
import QueueMonitor from './apps/QueueMonitor';
import Scheduler from './apps/Scheduler';
import AIPrediction from './apps/AIPrediction';
import Analytics from './apps/Analytics';
import DoctorManagement from './apps/DoctorManagement';

const componentMap: Record<string, React.ComponentType> = {
  QueueMonitor,
  Scheduler,
  AIPrediction,
  Analytics,
  DoctorManagement,
};

export default function WindowManager() {
  const { windows, closeWindow, minimizeWindow, focusWindow } = useOSStore();
  const [draggedWindow, setDraggedWindow] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  const handleDragEnd = (windowId: string, event: any, info: any) => {
    setPositions(prev => ({
      ...prev,
      [windowId]: {
        x: (prev[windowId]?.x || 0) + info.offset.x,
        y: (prev[windowId]?.y || 0) + info.offset.y
      }
    }));
    setDraggedWindow(null);
  };

  return (
    <div className="fixed inset-0 pointer-events-none pt-12 pb-20">
      <AnimatePresence>
        {windows.map((window) => {
          if (window.isMinimized) return null;
          
          const Component = componentMap[window.component];
          if (!Component) return null;

          const position = positions[window.id] || { x: 0, y: 0 };

          return (
            <motion.div
              key={window.id}
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => setDraggedWindow(window.id)}
              onDragEnd={(e, info) => handleDragEnd(window.id, e, info)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, x: position.x, y: position.y }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              style={{ 
                zIndex: window.zIndex,
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`
              }}
              className="absolute pointer-events-auto cursor-move"
              onClick={() => focusWindow(window.id)}
            >
              <div className="bg-black/60 backdrop-blur-xl border border-os-neon/30 rounded-2xl shadow-2xl overflow-hidden w-[85vw] max-w-4xl max-h-[75vh] flex flex-col">
                {/* Window Title Bar */}
                <div className="bg-gradient-to-r from-os-blue/50 to-os-cyan/30 px-4 py-3 flex items-center justify-between border-b border-os-neon/20 cursor-move">
                  <h3 className="text-white font-semibold">{window.title}</h3>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        minimizeWindow(window.id);
                      }}
                      className="w-8 h-8 rounded-full bg-yellow-500/20 hover:bg-yellow-500/40 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4 text-yellow-300" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        closeWindow(window.id);
                      }}
                      className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 text-red-300" />
                    </motion.button>
                  </div>
                </div>

                {/* Window Content */}
                <div className="flex-1 overflow-auto p-6 cursor-auto">
                  <Component />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

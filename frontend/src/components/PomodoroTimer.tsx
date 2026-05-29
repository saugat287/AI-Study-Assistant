import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import Draggable from 'react-draggable';
import { useAppStore } from '../../store/appStore';

export function PomodoroTimer() {
  const { activeWidget, setActiveWidget } = useAppStore();
  const isOpen = activeWidget === 'timer';
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setActiveWidget(isOpen ? 'none' : 'timer')}
        className="fixed bottom-20 sm:bottom-32 right-4 md:right-8 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#10b981] flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.8)]"
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
        transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <Timer className="w-6 h-6" />
      </motion.button>

      {/* Floating Widget */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
            <Draggable handle=".drag-handle" cancel=".cancel-drag">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="pointer-events-auto absolute bottom-24 left-4 right-4 mx-auto w-auto max-w-sm sm:left-auto sm:right-6 sm:w-72 sm:mx-0 bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden neon-card"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 to-[#10b981]/10 pointer-events-none" />
                <div className="p-4 border-b border-white/10 flex justify-between items-center drag-handle cursor-move bg-white/5">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-[#10b981]" />
                    <span className="text-sm font-semibold text-white">Focus Timer</span>
                  </div>
                  <button type="button" onClick={() => setActiveWidget('none')} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} className="cancel-drag p-1 text-gray-400 hover:text-white transition-colors">
                    &times;
                  </button>
                </div>
                
                <div className="p-6 text-center relative">
                  {/* Progress Ring */}
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" className="fill-none stroke-white/10 stroke-[6]" />
                      <circle 
                        cx="50" cy="50" r="45" 
                        className="fill-none stroke-[url(#gradient)] stroke-[6]"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * progress) / 100}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-black text-white drop-shadow-md">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <motion.button
                      onClick={toggleTimer}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                      {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                    </motion.button>
                    <motion.button
                      onClick={resetTimer}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </Draggable>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

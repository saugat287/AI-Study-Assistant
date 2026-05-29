import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { useAppStore } from '../../store/appStore';

import { PomodoroTimer } from '../PomodoroTimer';
import { MusicPlayer } from '../MusicPlayer';
import { ParticleBackground } from '../ParticleBackground';
import { ParticleCursor } from '../ParticleCursor';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/notes': 'My Notes',
  '/chat': 'AI Tutor',
  '/settings': 'Settings',
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { zenMode, activeWidget, setActiveWidget } = useAppStore();

  // Close sidebar and widgets on navigation
  useEffect(() => { 
    setSidebarOpen(false); 
    if (activeWidget !== 'none') setActiveWidget('none');
  }, [location.pathname]);

  const handleMainClick = () => {
    if (activeWidget !== 'none') {
      setActiveWidget('none');
    }
  };

  const title = pageTitles[location.pathname] ??
    Object.entries(pageTitles).find(([key]) => location.pathname.startsWith(key))?.[1] ?? '';

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-700 ${zenMode ? 'bg-black dark:bg-black' : 'bg-gray-50 dark:bg-aurora-dark'} relative p-0 sm:p-6 lg:p-8`}>
      <div className={`transition-opacity duration-700 ${zenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ParticleBackground />
        <div className="aurora-blob block" />
      </div>
      <ParticleCursor />
      
      {/* Floating Glass App Container */}
      <div className={`flex w-full max-w-[1600px] mx-auto h-full rounded-none sm:rounded-[2rem] overflow-hidden transition-all duration-700 ${zenMode ? 'border-transparent shadow-none bg-white/5 dark:bg-white/5 backdrop-blur-none' : 'border-0 sm:border border-gray-200/50 dark:border-white/10 shadow-none sm:shadow-2xl bg-white/95 sm:bg-white/40 dark:bg-gray-950 sm:dark:bg-black/20 backdrop-blur-3xl'} relative z-10`}>
        
        {!zenMode && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

        <div className="flex flex-col flex-1 min-w-0 bg-transparent relative">
          <div className={`transition-all duration-500 z-40 shrink-0 ${zenMode ? 'bg-transparent border-transparent opacity-30 hover:opacity-100' : 'bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-gray-100/80 dark:border-white/5'}`}>
            <TopBar onMenuClick={() => setSidebarOpen(true)} title={zenMode ? '' : title} />
          </div>
          <main className="flex-1 relative w-full overflow-y-auto overflow-x-hidden mt-5" onClick={handleMainClick}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 5, scale: 0.99, filter: 'blur(2px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -5, scale: 0.99, filter: 'blur(2px)' }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="min-h-full pb-40 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          {!zenMode && <BottomNav />}
        </div>
      </div>
      
      <PomodoroTimer />
      <MusicPlayer />
    </div>
  );
}

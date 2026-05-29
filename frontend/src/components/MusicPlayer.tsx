import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music, Volume2, VolumeX, FastForward } from 'lucide-react';
import Draggable from 'react-draggable';
import { useAppStore } from '../../store/appStore';

const TRACKS = [
  { title: "Deep Focus (Lofi Beats)", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" },
  { title: "Midnight Ambient", url: "https://cdn.pixabay.com/download/audio/2022/11/22/audio_78bd14e4b7.mp3?filename=ambient-piano-amp-strings-10711.mp3" },
  { title: "Cyberpunk Focus", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b1bb7a14.mp3?filename=cyberpunk-2099-10701.mp3" }
];

export function MusicPlayer() {
  const { activeWidget, setActiveWidget } = useAppStore();
  const isOpen = activeWidget === 'music';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const nextTrack = () => {
    const next = (trackIndex + 1) % TRACKS.length;
    setTrackIndex(next);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = TRACKS[next].url;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
    }
  };

  return (
    <>
      <audio 
        ref={audioRef} 
        src={TRACKS[trackIndex].url} 
        loop 
        onEnded={nextTrack}
        preload="none"
      />

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setActiveWidget(isOpen ? 'none' : 'music')}
        className="fixed bottom-[6rem] sm:bottom-[12rem] right-4 md:right-8 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#10b981] to-[#0ea5e9] flex items-center justify-center text-white shadow-[0_0_20px_rgba(14,165,233,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]"
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
        transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <Music className="w-6 h-6" />
        {isPlaying && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0ea5e9]"></span>
          </span>
        )}
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
                className="pointer-events-auto absolute bottom-40 left-4 right-4 mx-auto w-auto max-w-sm sm:left-auto sm:right-6 sm:w-80 sm:mx-0 bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_0_40px_rgba(14,165,233,0.2)] overflow-hidden neon-card"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 to-[#0ea5e9]/10 pointer-events-none" />
                
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center drag-handle cursor-move bg-white/5">
                  <div className="flex items-center gap-2 text-[#0ea5e9]">
                    <Music className="w-4 h-4" />
                    <span className="text-sm font-semibold text-white">Focus Player</span>
                  </div>
                  <button type="button" onClick={() => setActiveWidget('none')} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} className="cancel-drag p-1 text-gray-400 hover:text-white transition-colors">
                    &times;
                  </button>
                </div>
                
                {/* Body */}
                <div className="p-6 relative">
                  {/* Cassette / Visualizer Mock */}
                  <div className="w-full h-24 rounded-2xl bg-black/50 border border-white/10 mb-6 flex items-center justify-center overflow-hidden relative shadow-inner">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.15)_0%,_transparent_70%)]" />
                    {isPlaying ? (
                      <div className="flex items-center gap-1">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-2 bg-gradient-to-t from-[#10b981] to-[#0ea5e9] rounded-full"
                            animate={{ height: [10, 40 + Math.random() * 40, 10] }}
                            transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                    ) : (
                      <Music className="w-8 h-8 text-white/20" />
                    )}
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="font-bold text-white text-lg truncate px-2">{TRACKS[trackIndex].title}</h3>
                    <p className="text-xs text-gray-400 mt-1">Lofi Beats to Study To</p>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center items-center gap-6">
                    <motion.button
                      onClick={toggleMute}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </motion.button>

                    <motion.button
                      onClick={togglePlay}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-[#10b981] to-[#0ea5e9] flex items-center justify-center text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </motion.button>

                    <motion.button
                      onClick={nextTrack}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <FastForward className="w-5 h-5" />
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

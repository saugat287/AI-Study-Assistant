import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Draggable from 'react-draggable';
import {
  FileText, Brain, Layers, MessageCircle, ArrowRight, Plus, Clock, Flame
} from 'lucide-react';
import { notesApi } from '../api/notes';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { formatDate } from '../utils/format';

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.3 } }),
};

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => notesApi.dashboard().then((r) => r.data.data),
  });

  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleCardClick = (e: any, path: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    // Delay navigation slightly so they see the ripple
    setTimeout(() => navigate(path), 300);
  };

  if (isLoading) return <PageSpinner />;

  const stats = [
    { label: 'Notes', value: data?.noteCount ?? 0, icon: FileText, color: 'text-[#8b5cf6] bg-[#8b5cf6]/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]', path: '/notes' },
    { label: 'Summaries', value: data?.summaryCount ?? 0, icon: Brain, color: 'text-[#10b981] bg-[#10b981]/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]', path: '/notes' },
    { label: 'Quizzes', value: data?.quizCount ?? 0, icon: Layers, color: 'text-[#a78bfa] bg-[#a78bfa]/10 shadow-[0_0_15px_rgba(167,139,250,0.2)]', path: '/notes' },
    { label: 'Flashcard Decks', value: data?.flashcardDeckCount ?? 0, icon: Layers, color: 'text-[#6d28d9] bg-[#6d28d9]/10 shadow-[0_0_15px_rgba(109,40,217,0.2)]', path: '/notes' },
    { label: 'Chat Sessions', value: data?.chatCount ?? 0, icon: MessageCircle, color: 'text-[#34d399] bg-[#34d399]/10 shadow-[0_0_15px_rgba(52,211,153,0.2)]', path: '/chat' },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your studies.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative overflow-hidden rounded-[2rem] border border-gray-200 dark:border-white/10 bg-slate-950/90 p-6 sm:p-8 mb-8 shadow-2xl shadow-emerald-500/10"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_20%),radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.16),_transparent_18%)]" />
        <motion.div
          className="pointer-events-none absolute -left-10 top-24 h-28 w-28 rounded-full bg-emerald-400/20 blur-3xl"
          animate={{ scale: [1, 1.18, 1], x: [0, -12, 0], y: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute right-6 bottom-10 h-20 w-20 rounded-full bg-purple-500/25 blur-3xl"
          animate={{ scale: [1, 1.12, 1], x: [0, 10, 0], y: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_280px] items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-300/80">AI Study Command Center</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Study smarter with instant notes, summaries, and AI tutoring.</h2>
            <p className="mt-4 text-sm text-slate-300 max-w-2xl leading-7">
              Easily manage your study material, generate quizzes and flashcards, and keep everything mobile-friendly on laptop or phone.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/5 p-4 text-center shadow-lg shadow-slate-950/10 neon-card floating-glow">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-300">Notes</div>
              <div className="mt-3 text-3xl font-semibold text-white">{data?.noteCount ?? 0}</div>
            </div>
            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/5 p-4 text-center shadow-lg shadow-slate-950/10 neon-card floating-glow">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-300">Chat Sessions</div>
              <div className="mt-3 text-3xl font-semibold text-white">{data?.chatCount ?? 0}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 relative z-10">
        {stats.map((s, i) => (
          <Draggable key={s.label} position={{x:0, y:0}}>
            <motion.div 
              custom={i} 
              variants={cardVariants} 
              initial="hidden" 
              animate="visible" 
              className="cursor-pointer"
            >
              <motion.div
                onClick={(e) => handleCardClick(e, s.path)}
                whileHover={{ scale: 1.05, y: -4, rotateX: 5 }}
                whileTap={{ scale: 0.95, y: 0, rotateX: 10 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="bg-white dark:bg-[#1e1e2d] text-center shadow-xl shadow-[#8b5cf6]/10 dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 relative overflow-hidden group rounded-2xl p-6 h-full flex flex-col justify-center"
              >
                {/* Ripples */}
                {ripples.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute rounded-full bg-brand-500/20 dark:bg-white/10 pointer-events-none z-0"
                    style={{
                      left: ripple.x,
                      top: ripple.y,
                      width: 100,
                      height: 100,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
                {/* Glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none rounded-2xl z-0" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-[#10b981]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                
                <div className={`relative z-10 w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-3 pointer-events-none`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="relative z-10 text-2xl font-bold text-gray-900 dark:text-white pointer-events-none drop-shadow-md">{s.value}</div>
                <div className="relative z-10 text-xs text-gray-500 dark:text-gray-400 mt-0.5 pointer-events-none">{s.label}</div>
              </motion.div>
            </motion.div>
          </Draggable>
        ))}
      </div>

      {/* Study Progress and Achievements */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
        <Draggable>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="cursor-move relative">
            <Card className="shadow-2xl shadow-[#8b5cf6]/10 dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 relative overflow-hidden h-full group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/10 to-[#10b981]/10 opacity-30" />
              
              <Link to="/notes" className="absolute inset-0 z-20 cursor-pointer"></Link>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 dark:group-hover:bg-white/5 transition-colors z-10 pointer-events-none" />

              <div className="relative flex items-center justify-between pointer-events-none z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-orange-500 transition-colors">Study Streak</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">You're on a roll! Keep it up.</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-[#8b5cf6] drop-shadow-md">
                    {data?.studyStreak ?? 0} Days
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-widest mt-1">Current Streak</p>
                </div>
              </div>
              
              <div className="mt-6 relative pointer-events-none z-10">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  <span>Goal: 7 Days</span>
                  <span>{Math.min(100, Math.round(((data?.studyStreak ?? 0) / 7) * 100))}% Completed</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden shadow-inner">
                  <motion.div 
                    className="bg-gradient-to-r from-orange-500 via-[#8b5cf6] to-[#10b981] h-full rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((data?.studyStreak ?? 0) / 7) * 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Draggable>

        {/* Study Goals Widget */}
        <Draggable>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="cursor-move relative">
            <Card className="shadow-2xl shadow-[#10b981]/10 dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 relative overflow-hidden h-full group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/10 to-[#8b5cf6]/10 opacity-30" />
              
              <Link to="/notes" className="absolute inset-0 z-20 cursor-pointer"></Link>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 dark:group-hover:bg-white/5 transition-colors z-10 pointer-events-none" />

              <div className="relative pointer-events-none z-10">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2 group-hover:text-emerald-500 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> Weekly Goals
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Create 5 Notes</span>
                      <span>{Math.min(5, data?.weeklyNoteCount ?? 0)}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full shadow-[0_0_10px_#10b981]" style={{ width: `${Math.min(100, ((data?.weeklyNoteCount ?? 0) / 5) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Take 3 Quizzes</span>
                      <span>{Math.min(3, data?.weeklyQuizCount ?? 0)}/3</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-full rounded-full shadow-[0_0_10px_#8b5cf6]" style={{ width: `${Math.min(100, ((data?.weeklyQuizCount ?? 0) / 3) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Draggable>
      </div>

      {/* Quick actions + Recent notes */}
      <div className="grid lg:grid-cols-2 gap-6 relative z-10">
        {/* Quick actions */}
        <Draggable>
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="cursor-move">
            <Card className="shadow-2xl shadow-[#00f0ff]/10 dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 pointer-events-none">Quick Actions</h2>
              <div className="space-y-2">
                <Link to="/notes/new">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">New Note</p>
                      <p className="text-xs text-gray-500">Paste or type your study material</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
                  </div>
                </Link>
                <Link to="/chat">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Ask AI Tutor</p>
                      <p className="text-xs text-gray-500">Chat about any topic</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>
                </Link>
                <Link to="/notes">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">View All Notes</p>
                      <p className="text-xs text-gray-500">Browse your study library</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                </Link>
              </div>
            </Card>
          </motion.div>
        </Draggable>

        {/* Recent notes */}
        <Draggable>
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="cursor-move">
            <Card className="shadow-2xl shadow-[#d946ef]/10 dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-4 pointer-events-none">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Notes</h2>
                <Link to="/notes" className="text-xs text-brand-600 hover:underline font-medium pointer-events-auto">View all</Link>
              </div>
              {!data?.recentNotes?.length ? (
                <div className="text-center py-8 pointer-events-none">
                  <FileText className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No notes yet.</p>
                  <Link to="/notes/new" className="mt-2 inline-block pointer-events-auto">
                    <Button size="sm" variant="secondary">Create your first note</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.recentNotes.map((note) => (
                    <Link key={note.id} to={`/notes/${note.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{note.title}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(note.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </Draggable>
      </div>
    </div>
  );
}

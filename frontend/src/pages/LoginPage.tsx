import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Login failed';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#d946ef] via-[#7a00ff] to-[#00f0ff] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-white blur-2xl" />
        </div>
        <div className="relative text-white max-w-md z-10">
          <div className="flex items-center gap-3 mb-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <BookOpen className="w-6 h-6" />
            </motion.div>
            <span className="text-3xl font-bold tracking-tight">StudyAI</span>
          </div>
          <h2 className="text-5xl font-bold mb-6 leading-tight drop-shadow-md">Learn smarter,<br />not harder</h2>
          <p className="text-white/90 text-xl font-medium mb-12 drop-shadow">
            Upload your notes and let AI help you summarize, quiz yourself, and master any subject in a beautiful neon environment.
          </p>
          <div className="space-y-4">
            {['AI-powered summaries', 'Auto-generated quizzes', 'Smart flashcards', 'Personal AI tutor'].map((f, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                key={f} 
                className="flex items-center gap-3 text-white font-medium text-lg"
              >
                <div className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
                {f}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#050508]">
        {/* Static Floating Orbs for Unreal Theme (Animations removed to fix flickering) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d946ef] rounded-full mix-blend-screen filter blur-[120px] opacity-20 z-0 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#00f0ff] rounded-full mix-blend-screen filter blur-[150px] opacity-20 z-0 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="w-full max-w-md relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-2 mb-8 justify-center lg:hidden">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }} 
              transition={{ duration: 4, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d946ef] to-[#00f0ff] flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.5)]"
            >
              <BookOpen className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-bold text-white text-2xl tracking-tight">StudyAI</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1 text-center">Welcome back</h1>
          <p className="text-gray-300 mb-8 text-center text-sm">Sign in to continue your study session.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                className="pr-12"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 bottom-2.5 text-gray-400 hover:text-[#00f0ff] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="pt-2">
              <Button type="submit" loading={isSubmitting} fullWidth size="lg">
                Sign in
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00f0ff] font-medium hover:text-[#d946ef] hover:underline transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

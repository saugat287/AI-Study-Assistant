import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.register({ email: data.email, name: data.name, password: data.password });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Registration failed';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Static Floating Orbs for Unreal Theme (Animations removed to fix flickering) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d946ef] rounded-full mix-blend-screen filter blur-[120px] opacity-30 z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#00f0ff] rounded-full mix-blend-screen filter blur-[150px] opacity-20 z-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-2 mb-8 justify-center">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }} 
            transition={{ duration: 4, repeat: Infinity }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d946ef] to-[#00f0ff] flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.5)]"
          >
            <BookOpen className="w-5 h-5 text-white" />
          </motion.div>
          <span className="font-bold text-white text-2xl tracking-tight">StudyAI</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1 text-center">Create your account</h1>
        <p className="text-gray-300 mb-8 text-center text-sm">Start studying smarter today — it's free.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Full name" placeholder="Alex Johnson" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
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
          <Input
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <div className="pt-2">
            <Button type="submit" loading={isSubmitting} fullWidth size="lg">
              Create account
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00f0ff] font-medium hover:text-[#d946ef] hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

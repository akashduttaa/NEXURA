import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(state => state.login);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authAPI.login(formData);
      login(res.data.user, res.data.token);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        navigate('/signup', { state: { email: formData.email, step: 'otp' } });
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold gradient-text mb-2">Welcome Back</h1>
            <p className="text-nexura-text-dim">Login to your NEXURA account</p>
          </motion.div>

          <GlassCard hover={false} className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-nexura-text-dim mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="w-4 h-4 text-nexura-text-muted" /></div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-nexura-text focus:outline-none focus:border-nexura-cyan/50 focus:ring-1 focus:ring-nexura-cyan/50 transition-all"
                    placeholder="you@institution.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexura-text-dim mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-4 h-4 text-nexura-text-muted" /></div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-nexura-text focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <NeonButton type="submit" loading={loading} icon={LogIn} className="w-full mt-6">
                Sign In
              </NeonButton>
            </form>

            <div className="mt-6 text-center text-sm text-nexura-text-dim">
              Don't have an account?{' '}
              <button onClick={() => navigate('/signup')} className="text-nexura-cyan hover:underline hover:text-cyan-300 font-medium inline-flex items-center gap-1">
                Create one <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}

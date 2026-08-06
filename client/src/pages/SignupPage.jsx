import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Shield, ArrowRight, UserPlus, KeyRound } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function SignupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  
  const [step, setStep] = useState(location.state?.step === 'otp' ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: location.state?.email || '',
    password: '',
    role: 'student',
    referenceId: ''
  });

  const [otp, setOtp] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.signup(formData);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.verifyOTP({ email: formData.email, otp });
      login(res.data.user, res.data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold gradient-text mb-2">Join NEXURA</h1>
            <p className="text-nexura-text-dim">
              {step === 1 ? 'Create your account to get started' : 'Verify your email address'}
            </p>
          </motion.div>

          <GlassCard hover={false} className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form 
                  key="signup"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSignup} className="space-y-4"
                >
                  {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">{error}</div>}
                  
                  <div>
                    <label className="block text-sm font-medium text-nexura-text-dim mb-1.5">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="w-4 h-4 text-nexura-text-muted" /></div>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-nexura-text focus:outline-none focus:border-nexura-cyan/50 focus:ring-1 focus:ring-nexura-cyan/50 transition-all" placeholder="John Doe" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-nexura-text-dim mb-1.5">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="w-4 h-4 text-nexura-text-muted" /></div>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-nexura-text focus:outline-none focus:border-nexura-cyan/50 focus:ring-1 focus:ring-nexura-cyan/50 transition-all" placeholder="you@institution.edu" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-nexura-text-dim mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-4 h-4 text-nexura-text-muted" /></div>
                      <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-nexura-text focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all" placeholder="••••••••" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-nexura-text-dim mb-1.5">Role</label>
                      <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-nexura-text focus:outline-none focus:border-nexura-cyan/50 focus:ring-1 focus:ring-nexura-cyan/50 transition-all appearance-none cursor-pointer">
                        <option value="student" className="bg-nexura-bg">Student</option>
                        <option value="faculty" className="bg-nexura-bg">Faculty</option>
                        <option value="admin" className="bg-nexura-bg">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexura-text-dim mb-1.5">ID Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Shield className="w-4 h-4 text-nexura-text-muted" /></div>
                        <input type="text" name="referenceId" required={formData.role !== 'admin'} value={formData.referenceId} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-nexura-text focus:outline-none focus:border-nexura-cyan/50 transition-all" placeholder={formData.role === 'faculty' ? 'EMP...' : 'ROLL...'} />
                      </div>
                    </div>
                  </div>

                  <NeonButton type="submit" loading={loading} icon={UserPlus} className="w-full mt-6">
                    Create Account
                  </NeonButton>
                </motion.form>
              ) : (
                <motion.form 
                  key="otp"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOTP} className="space-y-5"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-nexura-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-nexura-cyan/20">
                      <Mail className="w-8 h-8 text-nexura-cyan" />
                    </div>
                    <p className="text-sm text-nexura-text-dim">We've sent a 6-digit verification code to <span className="text-white font-medium">{formData.email}</span></p>
                    <p className="text-xs text-nexura-text-muted mt-2">(Check your server console if email is not configured)</p>
                  </div>

                  {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">{error}</div>}
                  
                  <div>
                    <label className="block text-sm font-medium text-nexura-text-dim mb-1.5 text-center">Verification Code</label>
                    <div className="relative max-w-[200px] mx-auto">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="w-4 h-4 text-nexura-text-muted" /></div>
                      <input type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-center text-xl tracking-widest text-nexura-text focus:outline-none focus:border-nexura-emerald/50 focus:ring-1 focus:ring-nexura-emerald/50 transition-all" placeholder="000000" />
                    </div>
                  </div>

                  <NeonButton variant="emerald" type="submit" loading={loading} className="w-full mt-6">
                    Verify & Continue
                  </NeonButton>
                  
                  <div className="text-center mt-4">
                    <button type="button" onClick={() => setStep(1)} className="text-xs text-nexura-text-muted hover:text-white transition-colors">
                      Use a different email
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {step === 1 && (
              <div className="mt-6 text-center text-sm text-nexura-text-dim">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-nexura-purple hover:underline hover:text-purple-300 font-medium inline-flex items-center gap-1">
                  Sign in <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}

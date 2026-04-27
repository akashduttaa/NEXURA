import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Link2, BarChart3, ChevronRight, Sparkles, Shield, Zap } from 'lucide-react';
import NeonButton from '../components/ui/NeonButton';
import GlassCard from '../components/ui/GlassCard';
import PageTransition from '../components/layout/PageTransition';

const features = [
  { icon: Brain, title: 'AI Timetable Engine', desc: 'Genetic Algorithm generates conflict-free schedules in seconds. Handles faculty availability, room capacity, and workload balance automatically.', color: 'cyan' },
  { icon: Link2, title: 'Blockchain Records', desc: 'Every academic record and fee transaction is hashed and chained. Immutable, verifiable, and tamper-proof student data.', color: 'purple' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Faculty workload distribution, room utilization metrics, and conflict probability — all visualized in beautiful interactive charts.', color: 'pink' },
];

const stats = [
  { value: '99.7%', label: 'Conflict Resolution' },
  { value: '<2s', label: 'Generation Time' },
  { value: '256-bit', label: 'SHA Hashing' },
  { value: '100%', label: 'Data Integrity' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-50" />
          
          {/* Radial gradient overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-pink-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-nexura-cyan/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-nexura-cyan" />
              <span className="text-sm text-nexura-cyan font-medium">AI-Powered Academic Operating System</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-display font-black mb-6 leading-tight"
            >
              <span className="gradient-text">NEXURA</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl sm:text-2xl text-nexura-text-dim mb-4 max-w-2xl mx-auto"
            >
              Autonomous Academic Operating System
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-base text-nexura-text-muted mb-10 max-w-xl mx-auto"
            >
              Revolutionizing engineering institutions with AI-optimized scheduling and blockchain-backed data integrity
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <NeonButton onClick={() => navigate('/dashboard')} size="lg" icon={Zap}>
                Launch Dashboard
              </NeonButton>
              <NeonButton onClick={() => navigate('/timetable')} variant="ghost" size="lg" icon={ChevronRight}>
                Generate Timetable
              </NeonButton>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-nexura-cyan font-display">{stat.value}</div>
                  <div className="text-xs text-nexura-text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-nexura-cyan" />
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 gradient-text">Core Modules</h2>
              <p className="text-nexura-text-dim max-w-lg mx-auto">Three powerful systems working in harmony to transform academic management</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <GlassCard key={i} delay={i * 0.15} glow={feature.color}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color === 'cyan' ? 'from-cyan-500/20 to-cyan-500/5' : feature.color === 'purple' ? 'from-purple-500/20 to-purple-500/5' : 'from-pink-500/20 to-pink-500/5'} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color === 'cyan' ? 'text-cyan-400' : feature.color === 'purple' ? 'text-purple-400' : 'text-pink-400'}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-nexura-text mb-2">{feature.title}</h3>
                  <p className="text-sm text-nexura-text-dim leading-relaxed">{feature.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 gradient-text">How It Works</h2>
            </motion.div>

            <div className="space-y-6">
              {[
                { step: '01', title: 'Input Constraints', desc: 'Faculty availability, courses, rooms, and capacity data are loaded into the system.' },
                { step: '02', title: 'AI Optimization', desc: 'Our Genetic Algorithm evolves 300 generations of 60 candidate timetables to find the optimal schedule.' },
                { step: '03', title: 'Blockchain Verification', desc: 'Every generated schedule and academic record is hashed with SHA-256 and chained for immutable audit trails.' },
                { step: '04', title: 'Real-time Dashboard', desc: 'Admins, faculty, and students access role-specific views with live analytics and instant updates.' },
              ].map((item, i) => (
                <GlassCard key={i} delay={i * 0.1} className="flex items-start gap-6">
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center font-display font-bold text-nexura-cyan text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-nexura-text mb-1">{item.title}</h3>
                    <p className="text-sm text-nexura-text-dim">{item.desc}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <GlassCard hover={false} className="py-12 px-8">
              <Shield className="w-12 h-12 text-nexura-cyan mx-auto mb-6" />
              <h2 className="text-3xl font-display font-bold mb-4 gradient-text">Ready to Transform Your Institution?</h2>
              <p className="text-nexura-text-dim mb-8 max-w-md mx-auto">Experience the future of academic management with AI optimization and blockchain security.</p>
              <NeonButton onClick={() => navigate('/dashboard')} size="lg" icon={Zap}>
                Get Started Now
              </NeonButton>
            </GlassCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-display text-sm text-nexura-text-dim">© 2026 NEXURA. All rights reserved.</span>
            <span className="text-xs text-nexura-text-muted">AI + Blockchain Autonomous Academic Operating System</span>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}

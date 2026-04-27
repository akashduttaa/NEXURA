import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function StatCard({ label, value, icon: Icon, color = 'cyan', suffix = '', delay = 0 }) {
  const [count, setCount] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;

  useEffect(() => {
    if (numericValue === 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [numericValue]);

  const colors = {
    cyan: { bg: 'from-cyan-500/20 to-cyan-500/5', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    purple: { bg: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', border: 'border-purple-500/20' },
    pink: { bg: 'from-pink-500/20 to-pink-500/5', text: 'text-pink-400', border: 'border-pink-500/20' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber: { bg: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400', border: 'border-amber-500/20' },
  };

  const c = colors[color] || colors.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass rounded-xl p-5 border ${c.border} bg-gradient-to-br ${c.bg}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-nexura-text-dim">{label}</span>
        {Icon && <Icon className={`w-5 h-5 ${c.text}`} />}
      </div>
      <div className={`text-3xl font-bold ${c.text} font-display`}>
        {typeof value === 'number' ? count : value}{suffix}
      </div>
    </motion.div>
  );
}

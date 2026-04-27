import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function NeonButton({ children, onClick, variant = 'cyan', size = 'md', loading = false, disabled = false, className = '', icon: Icon }) {
  const variants = {
    cyan: 'from-cyan-500 to-blue-500 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]',
    purple: 'from-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]',
    pink: 'from-pink-500 to-rose-500 shadow-[0_0_20px_rgba(244,114,182,0.3)] hover:shadow-[0_0_30px_rgba(244,114,182,0.5)]',
    emerald: 'from-emerald-500 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]',
    ghost: 'from-transparent to-transparent border border-white/20 shadow-none hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`relative bg-gradient-to-r ${variants[variant]} ${sizes[size]} rounded-lg font-semibold text-white transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : Icon ? <Icon className="w-5 h-5" /> : null}
      {children}
    </motion.button>
  );
}

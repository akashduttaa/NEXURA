import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true, glow = 'cyan', delay = 0, onClick }) {
  const glowClasses = {
    cyan: 'hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]',
    purple: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
    pink: 'hover:shadow-[0_0_30px_rgba(244,114,182,0.15)]',
    none: ''
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      onClick={onClick}
      className={`glass rounded-xl p-6 transition-all duration-300 ${hover ? glowClasses[glow] || glowClasses.cyan : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

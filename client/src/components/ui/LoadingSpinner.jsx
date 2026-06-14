import { motion } from 'framer-motion';

const colors = {
  cyan: 'border-nexura-cyan/20 border-t-nexura-cyan',
  purple: 'border-nexura-purple/20 border-t-nexura-purple',
  pink: 'border-nexura-pink/20 border-t-nexura-pink',
  emerald: 'border-nexura-emerald/20 border-t-nexura-emerald',
  amber: 'border-nexura-amber/20 border-t-nexura-amber',
};

const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };

export default function LoadingSpinner({ size = 'md', color = 'cyan', text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <motion.div
        className={`${sizes[size]} rounded-full border-2 ${colors[color] || colors.cyan}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p className="text-nexura-text-dim text-sm animate-pulse">{text}</p>}
    </div>
  );
}

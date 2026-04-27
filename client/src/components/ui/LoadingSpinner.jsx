import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <motion.div
        className={`${sizes[size]} rounded-full border-2 border-nexura-cyan/20 border-t-nexura-cyan`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p className="text-nexura-text-dim text-sm animate-pulse">{text}</p>}
    </div>
  );
}

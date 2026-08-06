import { motion } from 'framer-motion';

const SIZES = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

const COLORS = {
  cyan:   { track: 'border-cyan-900/30',   fill: 'border-t-cyan-400',   text: 'text-cyan-400'   },
  purple: { track: 'border-purple-900/30', fill: 'border-t-purple-400', text: 'text-purple-400' },
  green:  { track: 'border-green-900/30',  fill: 'border-t-green-400',  text: 'text-green-400'  },
  amber:  { track: 'border-amber-900/30',  fill: 'border-t-amber-400',  text: 'text-amber-400'  },
  white:  { track: 'border-white/20',      fill: 'border-t-white',      text: 'text-white/80'   },
};

export default function LoadingSpinner({
  size    = 'md',
  color   = 'cyan',
  text    = 'Loading...',
  inline  = false,
  overlay = false,
}) {
  const s = SIZES[size]   ?? SIZES.md;
  const c = COLORS[color] ?? COLORS.cyan;

  const spinnerEl = (
    <div className={`flex flex-col items-center justify-center gap-4 ${inline ? '' : 'py-12'}`}>
      <motion.div
        className={`${s} rounded-full border-2 ${c.track} ${c.fill}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className={`text-sm animate-pulse ${c.text}`}>{text}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
        {spinnerEl}
      </div>
    );
  }

  return spinnerEl;
}
import { useId } from 'react';

export default function LoadingSpinner({
  size = 'md',        // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  color = 'cyan',     // 'cyan' | 'purple' | 'pink' | 'emerald' | 'amber' | 'red' | 'white'
  variant = 'neon',   // 'neon' | 'classic' | 'dual' | 'pulse'
  text = '',
  className = '',
  spinnerClassName = ''
}) {
  const uniqueId = useId().replace(/:/g, '');
  const gradientId = `spinner-gradient-${uniqueId}`;

  // Sizes mapping
  const sizes = {
    xs: { dimensions: 'w-4 h-4', strokeWidth: 3, borderSize: 'border' },
    sm: { dimensions: 'w-6 h-6', strokeWidth: 4, borderSize: 'border-2' },
    md: { dimensions: 'w-10 h-10', strokeWidth: 4, borderSize: 'border-[3px]' },
    lg: { dimensions: 'w-16 h-16', strokeWidth: 5, borderSize: 'border-4' },
    xl: { dimensions: 'w-24 h-24', strokeWidth: 6, borderSize: 'border-[6px]' },
    '2xl': { dimensions: 'w-32 h-32', strokeWidth: 8, borderSize: 'border-8' },
  };

  const selectedSize = sizes[size] || sizes.md;

  // Colors configurations
  const colorConfigs = {
    cyan: {
      start: '#00f0ff',
      end: '#3b82f6',
      glow: 'rgba(0, 240, 255, 0.4)',
      dualInner: 'border-nexura-cyan',
      dualOuter: 'border-blue-500/40',
      classicBase: 'border-nexura-cyan/20',
      classicSpin: 'border-t-nexura-cyan',
      pulseBg: 'bg-nexura-cyan',
      text: 'text-nexura-cyan',
    },
    purple: {
      start: '#a855f7',
      end: '#ec4899',
      glow: 'rgba(168, 85, 247, 0.4)',
      dualInner: 'border-nexura-purple',
      dualOuter: 'border-pink-500/40',
      classicBase: 'border-nexura-purple/20',
      classicSpin: 'border-t-nexura-purple',
      pulseBg: 'bg-nexura-purple',
      text: 'text-nexura-purple',
    },
    pink: {
      start: '#f472b6',
      end: '#f43f5e',
      glow: 'rgba(244, 114, 182, 0.4)',
      dualInner: 'border-nexura-pink',
      dualOuter: 'border-rose-500/40',
      classicBase: 'border-nexura-pink/20',
      classicSpin: 'border-t-nexura-pink',
      pulseBg: 'bg-nexura-pink',
      text: 'text-nexura-pink',
    },
    emerald: {
      start: '#10b981',
      end: '#14b8a6',
      glow: 'rgba(16, 185, 129, 0.4)',
      dualInner: 'border-nexura-emerald',
      dualOuter: 'border-teal-500/40',
      classicBase: 'border-nexura-emerald/20',
      classicSpin: 'border-t-nexura-emerald',
      pulseBg: 'bg-nexura-emerald',
      text: 'text-nexura-emerald',
    },
    amber: {
      start: '#f59e0b',
      end: '#f97316',
      glow: 'rgba(245, 158, 11, 0.4)',
      dualInner: 'border-nexura-amber',
      dualOuter: 'border-orange-500/40',
      classicBase: 'border-nexura-amber/20',
      classicSpin: 'border-t-nexura-amber',
      pulseBg: 'bg-nexura-amber',
      text: 'text-nexura-amber',
    },
    red: {
      start: '#ef4444',
      end: '#b91c1c',
      glow: 'rgba(239, 68, 68, 0.4)',
      dualInner: 'border-nexura-red',
      dualOuter: 'border-red-600/40',
      classicBase: 'border-nexura-red/20',
      classicSpin: 'border-t-nexura-red',
      pulseBg: 'bg-nexura-red',
      text: 'text-nexura-red',
    },
    white: {
      start: '#ffffff',
      end: '#94a3b8',
      glow: 'rgba(255, 255, 255, 0.3)',
      dualInner: 'border-white',
      dualOuter: 'border-white/20',
      classicBase: 'border-white/10',
      classicSpin: 'border-t-white',
      pulseBg: 'bg-white',
      text: 'text-white',
    },
  };

  const selectedColor = colorConfigs[color] || colorConfigs.cyan;

  const renderSpinner = () => {
    switch (variant) {
      case 'classic':
        return (
          <div
            className={`rounded-full ${selectedSize.borderSize} ${selectedColor.classicBase} ${selectedColor.classicSpin} animate-spin ${selectedSize.dimensions} ${spinnerClassName}`}
          />
        );

      case 'dual':
        return (
          <div className={`relative ${selectedSize.dimensions} ${spinnerClassName}`}>
            <div
              className={`absolute inset-0 rounded-full ${selectedSize.borderSize} border-transparent ${selectedColor.classicSpin} animate-spin`}
              style={{ filter: `drop-shadow(0 0 4px ${selectedColor.glow})` }}
            />
            <div
              className={`absolute inset-1 rounded-full ${selectedSize.borderSize} border-transparent ${selectedColor.dualOuter} animate-[spin_1.5s_linear_infinite_reverse]`}
            />
          </div>
        );

      case 'pulse':
        return (
          <div className={`relative flex items-center justify-center ${selectedSize.dimensions} ${spinnerClassName}`}>
            <div className={`absolute inset-0 rounded-full opacity-40 animate-ping ${selectedColor.pulseBg}`} />
            <div className={`absolute inset-2 rounded-full opacity-70 animate-pulse ${selectedColor.pulseBg}`} />
            <div className={`relative w-1/3 h-1/3 rounded-full ${selectedColor.pulseBg}`}
                 style={{ boxShadow: `0 0 10px ${selectedColor.glow}` }} />
          </div>
        );

      case 'neon':
      default:
        return (
          <div className="relative" style={{ filter: `drop-shadow(0 0 6px ${selectedColor.glow})` }}>
            <svg
              className={`animate-spin ${selectedSize.dimensions} ${spinnerClassName}`}
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={selectedColor.start} />
                  <stop offset="100%" stopColor={selectedColor.end} />
                </linearGradient>
              </defs>
              <circle
                cx="25"
                cy="25"
                r="20"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth={selectedSize.strokeWidth}
              />
              <circle
                cx="25"
                cy="25"
                r="20"
                stroke={`url(#${gradientId})`}
                strokeWidth={selectedSize.strokeWidth}
                strokeLinecap="round"
                strokeDasharray="90 35"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-8 ${className}`}>
      {renderSpinner()}
      {text && (
        <p className={`text-sm font-semibold tracking-wide animate-pulse ${selectedColor.text} opacity-80 max-w-xs text-center`}>
          {text}
        </p>
      )}
    </div>
  );
}

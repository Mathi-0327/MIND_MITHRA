import React from 'react';

interface ManasLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showTagline?: boolean;
  theme?: 'dark' | 'light' | 'amber' | 'teal';
  animated?: boolean;
  className?: string;
}

export const ManasLogo: React.FC<ManasLogoProps> = ({
  size = 'md',
  showTagline = true,
  theme = 'amber',
  animated = false,
  className = '',
}) => {
  const sizeMap = {
    xs: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]', gap: 'gap-2' },
    sm: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]', gap: 'gap-2.5' },
    md: { icon: 'w-11 h-11', text: 'text-xl', sub: 'text-xs', gap: 'gap-3' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl sm:text-3xl', sub: 'text-xs', gap: 'gap-3.5' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm', gap: 'gap-4' },
    hero: { icon: 'w-20 h-20 sm:w-22 sm:h-22', text: 'text-4xl sm:text-5xl', sub: 'text-sm sm:text-base', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`} id="manas-app-logo">
      {/* Sleek Dual-Ring Mind & Lotus Care Emblem in Warm App Gradient */}
      <div
        className={`relative ${currentSize.icon} shrink-0 rounded-2xl sm:rounded-3xl flex items-center justify-center p-2 transition-all duration-300 ${
          animated ? 'hover:scale-105' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #059669 100%)',
          boxShadow: '0 8px 24px -4px rgba(217, 119, 6, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Glow Ring behind logo */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-amber-400/25 blur-md -z-10 animate-pulse" />

        {/* Custom Mind & Lotus Harmony Vector */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Outer Lotus Care Petals */}
          <path
            d="M20 34C20 34 8 26.5 8 17.5C8 12.5 12 8.5 17 8.5C18.8 8.5 20 9.8 20 9.8C20 9.8 21.2 8.5 23 8.5C28 8.5 32 12.5 32 17.5C32 26.5 20 34 20 34Z"
            fill="white"
            fillOpacity="0.2"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Cognitive Arch / Synapse Link */}
          <path
            d="M13.5 19C13.5 15.4 16.4 12.5 20 12.5C23.6 12.5 26.5 15.4 26.5 19C26.5 23 20 28.5 20 28.5C20 28.5 13.5 23 13.5 19Z"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Core Illuminated Star of Clarity */}
          <circle cx="20" cy="18.5" r="2.5" fill="white" />
          <path
            d="M20 13.5V14.5M20 22.5V23.5M15 18.5H16M24 18.5H25"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Modern High-End Typography matching App Style */}
      <div className="flex flex-col text-left leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight ${currentSize.text} ${
              theme === 'dark' || theme === 'amber'
                ? 'text-white'
                : 'text-stone-900'
            }`}
            style={{
              letterSpacing: '-0.035em',
            }}
          >
            MIND MITHRA
          </span>
          <span
            className={`px-1.5 py-0.5 rounded-md font-extrabold uppercase text-[9px] tracking-wider shadow-xs ${
              theme === 'dark'
                ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
                : 'bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            SIH
          </span>
        </div>

        {showTagline && (
          <span
            className={`font-semibold mt-1 ${currentSize.sub} ${
              theme === 'dark' ? 'text-amber-200/90' : 'text-stone-500'
            }`}
          >
            AI Cultural Cognitive Companion
          </span>
        )}
      </div>
    </div>
  );
};

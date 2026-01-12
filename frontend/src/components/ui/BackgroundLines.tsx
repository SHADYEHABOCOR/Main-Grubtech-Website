import React from 'react';

export const BackgroundLines: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Static decorative lines - CSS only, no JS animations */}
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="bgGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="20%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="bgGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0" />
            <stop offset="30%" stopColor="#93c5fd" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#93c5fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="bgGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Static flowing lines */}
        <path
          d="M-100 200 Q 200 100, 400 200 T 800 180 T 1200 220 T 1600 180"
          stroke="url(#bgGradient1)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />

        <path
          d="M-100 400 Q 150 300, 350 400 T 750 380 T 1150 420 T 1550 380"
          stroke="url(#bgGradient2)"
          strokeWidth="1"
          fill="none"
          opacity="0.3"
        />

        <path
          d="M-100 600 Q 250 500, 450 600 T 850 580 T 1250 620 T 1650 580"
          stroke="url(#bgGradient1)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.35"
        />

        <path
          d="M1200 0 Q 1100 200, 1300 400 T 1100 800"
          stroke="url(#bgGradient3)"
          strokeWidth="1"
          fill="none"
          opacity="0.25"
        />

        <path
          d="M200 0 Q 300 200, 100 400 T 300 800"
          stroke="url(#bgGradient3)"
          strokeWidth="1"
          fill="none"
          opacity="0.2"
        />
      </svg>
    </div>
  );
};

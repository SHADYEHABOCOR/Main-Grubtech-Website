import React from 'react';
import './InfiniteSlider.css';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface InfiniteSliderProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

export const InfiniteSlider: React.FC<InfiniteSliderProps> = ({
  children,
  speed = 40,
  direction = 'left',
  pauseOnHover = true,
  className = '',
}) => {
  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={`infinite-slider-wrapper overflow-hidden ${className}`}
      dir="ltr"
    >
      <div
        className={`infinite-slider-track ${pauseOnHover && !prefersReducedMotion ? 'pause-on-hover' : ''}`}
        style={{
          '--duration': `${speed}s`,
          '--direction': direction === 'left' ? 'normal' : 'reverse',
          animation: prefersReducedMotion ? 'none' : undefined,
        } as React.CSSProperties}
      >
        {/* First set of items */}
        <div className="infinite-slider-content">
          {children}
        </div>
        {/* Duplicate set for seamless loop */}
        <div className="infinite-slider-content" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
};

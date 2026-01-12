import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface CarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  autoPlay = true,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();

  const paginate = useCallback((newDirection: number) => {
    if (isAnimating) return;

    setIsAnimating(true);

    setCurrentIndex((prevIndex) => {
      if (newDirection === 1) {
        return prevIndex === children.length - 1 ? 0 : prevIndex + 1;
      } else {
        return prevIndex === 0 ? children.length - 1 : prevIndex - 1;
      }
    });

    // Reset animation lock after transition (matches CSS transition duration)
    // Use 0ms timeout when reduced motion is preferred for instant changes
    setTimeout(() => setIsAnimating(false), prefersReducedMotion ? 0 : 300);
  }, [children.length, isAnimating, prefersReducedMotion]);

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;

    setIsAnimating(true);
    setCurrentIndex(index);

    // Reset animation lock after transition (matches CSS transition duration)
    // Use 0ms timeout when reduced motion is preferred for instant changes
    setTimeout(() => setIsAnimating(false), prefersReducedMotion ? 0 : 300);
  };

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, paginate]);

  return (
    <div className={`${className}`}>
      {/* Slide Content - Grid layout to maintain consistent height */}
      <div className="relative w-full overflow-hidden">
        <div className="grid grid-cols-1 grid-rows-1">
          {children.map((child, index) => (
            <div
              key={index}
              className={`w-full col-start-1 row-start-1 ${!prefersReducedMotion ? 'transition-opacity duration-300' : ''}`}
              style={{
                opacity: index === currentIndex ? 1 : 0,
                zIndex: index === currentIndex ? 1 : 0,
                pointerEvents: index === currentIndex ? 'auto' : 'none',
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls - Single Row - Always LTR */}
      <div className="flex items-center justify-between px-2 sm:px-4 mt-4 md:mt-6" dir="ltr">
        {/* Dots Indicator - Left Side */}
        {showDots && (
          <div className="flex gap-1.5 md:gap-2">
            {children.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 md:h-2.5 rounded-full ${!prefersReducedMotion ? 'transition-all duration-300' : ''} ${index === currentIndex
                  ? 'w-6 md:w-10 bg-blue-600'
                  : 'w-2 md:w-2.5 bg-gray-300 hover:bg-blue-300'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Navigation Arrows - Right Side - Arrows always point left/right */}
        {showArrows && (
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={() => paginate(-1)}
              className={`p-2 md:p-3 rounded-full bg-white border border-gray-200 hover:border-blue-600 hover:text-blue-600 ${!prefersReducedMotion ? 'transition-all duration-300' : ''} group shadow-sm`}
              aria-label="Previous slide"
            >
              <ChevronLeft className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 ${!prefersReducedMotion ? 'transition-colors' : ''}`} />
            </button>
            <button
              onClick={() => paginate(1)}
              className={`p-2 md:p-3 rounded-full bg-white border border-gray-200 hover:border-blue-600 hover:text-blue-600 ${!prefersReducedMotion ? 'transition-all duration-300' : ''} group shadow-sm`}
              aria-label="Next slide"
            >
              <ChevronRight className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-600 ${!prefersReducedMotion ? 'transition-colors' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

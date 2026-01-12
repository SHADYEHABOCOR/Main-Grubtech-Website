import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ImageSliderProps {
  images: string[];
  autoPlayInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
  className?: string;
  overlays?: React.ReactNode[];
}

interface SlideState {
  index: number;
  isExiting: boolean;
  id: string; // Unique identifier for each slide instance
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  autoPlayInterval = 5000,
  showControls = true,
  showDots = true,
  className = '',
  overlays,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState<SlideState[]>([{ index: 0, isExiting: false, id: `slide-${Date.now()}-0` }]);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const prefersReducedMotion = useReducedMotion();

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  // Handle slide transitions with exit animations
  useEffect(() => {
    // On mobile, instantly switch slides without transitions
    if (prefersReducedMotion) {
      setSlides([{ index: currentIndex, isExiting: false, id: `slide-${Date.now()}-${currentIndex}` }]);
      return;
    }

    // Desktop: Use smooth transitions
    // Mark all existing slides as exiting
    setSlides((prev) => prev.map((slide) => ({ ...slide, isExiting: true })));

    // Add new slide with unique ID
    setSlides((prev) => [...prev, { index: currentIndex, isExiting: false, id: `slide-${Date.now()}-${currentIndex}` }]);

    // Remove exiting slides after animation completes
    const timeout = setTimeout(() => {
      setSlides((prev) => prev.filter((slide) => !slide.isExiting));
    }, 700); // Match animation duration

    return () => clearTimeout(timeout);
  }, [currentIndex, prefersReducedMotion]);

  useEffect(() => {
    if (autoPlayInterval && images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, autoPlayInterval);
      return () => clearInterval(timer);
    }
  }, [currentIndex, autoPlayInterval, images.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) return null;

  return (
    <div className="w-full h-full">
      <div
        className={`relative w-full h-full overflow-hidden rounded-2xl ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`w-full h-full absolute inset-0 ${
              prefersReducedMotion
                ? '' // No transition on mobile
                : `transition-all duration-700 ${
                    slide.isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`
            }`}
            style={{
              animation:
                !slide.isExiting && !prefersReducedMotion
                  ? 'image-slider-zoom-in 0.7s cubic-bezier(0.43, 0.13, 0.23, 0.96) forwards'
                  : 'none',
            }}
          >
            <OptimizedImage
              src={images[slide.index]}
              alt={`Slide ${slide.index + 1}`}
              className="w-full h-full object-cover"
              priority={slide.index === 0}
              useWebP={true}
              sizes="100vw"
            />
            {overlays && overlays[slide.index] && (
              <div
                className="absolute inset-0"
                style={{
                  animation:
                    !slide.isExiting && !prefersReducedMotion
                      ? 'slider-overlay-fade-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards'
                      : 'none',
                  opacity: slide.isExiting && !prefersReducedMotion ? 0 : 1,
                }}
              >
                {overlays[slide.index]}
              </div>
            )}
          </div>
        ))}

        {/* Navigation Controls */}
        {showControls && images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}

        {/* Dots Indicator - Inside on desktop, outside on mobile */}
        {showDots && images.length > 1 && (
          <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary w-8'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dots Indicator - Outside on mobile */}
      {showDots && images.length > 1 && (
        <div className="flex md:hidden justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-gray-400 hover:bg-gray-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ParsedVideo } from '../../utils/videoHelpers';
import { FocusTrap } from '../accessibility';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: ParsedVideo | null;
  title?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, video, title }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();

  // Handle mount/unmount and exit animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsExiting(false);
    } else if (shouldRender) {
      // Trigger exit animation
      setIsExiting(true);
      // Remove from DOM after animation completes (300ms for normal, instant for reduced motion)
      const exitDuration = prefersReducedMotion ? 0 : 300;
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, exitDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender, prefersReducedMotion]);

  // Close on ESC key and manage body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!video || !shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/90 z-50 cursor-pointer ${
          !prefersReducedMotion ? 'transition-opacity duration-300' : ''
        } ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
        aria-label="Close video"
      />

      {/* Modal Container */}
      <FocusTrap active={isOpen && !isExiting} onEscape={onClose}>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Video player'}
        >
          <div
            className={`relative w-full max-w-5xl pointer-events-auto ${
              !prefersReducedMotion ? 'transition-all duration-300' : ''
            } ${
              isExiting
                ? `opacity-0 ${!prefersReducedMotion ? 'scale-90 translate-y-5' : ''}`
                : `opacity-100 ${!prefersReducedMotion ? 'scale-100 translate-y-0' : ''}`
            }`}
            style={{
              animation: !isExiting && !prefersReducedMotion ? 'video-modal-scale-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label="Close video modal"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Title */}
            {title && (
              <div className="absolute -top-12 left-0 text-white text-lg font-semibold mb-2">
                {title}
              </div>
            )}

            {/* Video Container */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              {video.type === 'direct' ? (
                <video
                  src={video.embedUrl}
                  controls
                  autoPlay
                  className="absolute inset-0 w-full h-full rounded-lg"
                  aria-label={title || 'Video player'}
                />
              ) : (
                <iframe
                  src={video.embedUrl}
                  className="absolute inset-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={title || 'Video player'}
                />
              )}
            </div>
          </div>
        </div>
      </FocusTrap>
    </>
  );
};

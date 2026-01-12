import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { FocusTrap } from '../accessibility';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsExiting(false);
      document.body.style.overflow = 'hidden';
    } else if (shouldRender) {
      // Start exit animation
      setIsExiting(true);

      // Unmount after exit animation completes (200ms for normal, instant for reduced motion)
      const exitDuration = prefersReducedMotion ? 0 : 200;
      setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, exitDuration);

      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, shouldRender, prefersReducedMotion]);

  if (!shouldRender) return null;

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 bg-black/50 z-[100] overflow-y-auto ${
        !prefersReducedMotion ? 'transition-opacity duration-200' : ''
      } ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <FocusTrap active={isOpen && !isExiting} onEscape={onClose}>
        <div
          className="min-h-screen flex items-center justify-center p-4 pt-24 pb-16"
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Modal'}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-lg shadow-xl w-full ${maxWidthClasses[maxWidth]} my-8 ${
              !prefersReducedMotion ? 'transition-all duration-200' : ''
            } ${
              isExiting
                ? `opacity-0 ${!prefersReducedMotion ? 'scale-95 translate-y-5' : ''}`
                : `opacity-100 ${!prefersReducedMotion ? 'scale-100 translate-y-0' : ''}`
            }`}
            style={{
              animation: !isExiting && !prefersReducedMotion ? 'modal-scale-fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none',
            }}
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-background-alt rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ring-offset-white ring-offset-2"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            )}
            <div className="p-6 max-h-[calc(90vh-4rem)] overflow-y-auto">{children}</div>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};

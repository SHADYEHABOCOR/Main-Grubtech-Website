import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  isExiting?: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook to access toast notifications
 * @example
 * const toast = useToast();
 * toast.success('Item saved successfully!');
 * toast.error('Failed to save item');
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
  /** Maximum number of toasts to show at once */
  maxToasts?: number;
  /** Default duration in milliseconds */
  defaultDuration?: number;
  /** Position of the toast container */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

/**
 * Toast Provider Component
 * Wrap your app with this to enable toast notifications
 */
export function ToastProvider({
  children,
  maxToasts = 5,
  defaultDuration = 4000,
  position = 'top-right',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    // Trigger exit animation
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, isExiting: true } : toast
      )
    );

    // Remove from DOM after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 200); // Match animation duration
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = {
        id,
        message,
        type,
        duration: duration ?? defaultDuration,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Limit number of toasts
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });
    },
    [defaultDuration, maxToasts]
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, 'success', duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast(message, 'error', duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => showToast(message, 'warning', duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => showToast(message, 'info', duration),
    [showToast]
  );

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div
        className={`fixed ${positionClasses[position]} z-[9999] flex flex-col gap-2 pointer-events-none`}
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  // Progress bar state and animation refs
  const [progress, setProgress] = useState(100);
  const prefersReducedMotion = useReducedMotion();
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const remainingDurationRef = useRef<number>(toast.duration || 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Check if this toast should auto-dismiss (duration > 0)
  const shouldAutoDismiss = toast.duration && toast.duration > 0;

  // Cleanup function for animation and timer
  const cleanup = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  // Start or resume the progress animation
  const startAnimation = useCallback(() => {
    // Don't start if duration is 0 or negative (infinite toast)
    if (!toast.duration || toast.duration <= 0) return;

    // Don't proceed if component is unmounted
    if (!isMountedRef.current) return;

    // Clean up any existing timers/animations
    cleanup();

    startTimeRef.current = Date.now();
    const duration = remainingDurationRef.current;

    // Set timer for auto-dismiss
    timerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onClose();
      }
    }, duration); // Use actual duration for dismiss, not effective duration

    // Skip progress bar animation if reduced motion is preferred
    if (prefersReducedMotion) {
      return;
    }

    // Animate progress bar
    const animate = () => {
      // Check if still mounted before updating state
      if (!isMountedRef.current) return;

      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      const progressValue = Math.max(0, 100 - (elapsed / duration) * 100);

      setProgress(progressValue);

      if (progressValue > 0 && isMountedRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete, clean up
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [toast.duration, onClose, cleanup, prefersReducedMotion]);

  // Pause the progress animation
  const pauseAnimation = useCallback(() => {
    if (!startTimeRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    remainingDurationRef.current = Math.max(0, remainingDurationRef.current - elapsed);

    cleanup();
  }, [cleanup]);

  // Handle mouse enter (pause)
  const handleMouseEnter = useCallback(() => {
    if (!shouldAutoDismiss) return; // Don't pause infinite toasts
    pauseAnimation();
  }, [shouldAutoDismiss, pauseAnimation]);

  // Handle mouse leave (resume)
  const handleMouseLeave = useCallback(() => {
    if (!shouldAutoDismiss) return; // Don't resume infinite toasts
    startAnimation();
  }, [shouldAutoDismiss, startAnimation]);

  // Start animation on mount (only once)
  useEffect(() => {
    isMountedRef.current = true;

    if (shouldAutoDismiss) {
      startAnimation();
    }

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount/unmount

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconStyles = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const progressBarStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`pointer-events-auto relative flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-[400px] overflow-hidden ${styles[toast.type]} ${
        toast.isExiting
          ? 'opacity-0 scale-95 -translate-y-5 transition-all duration-200'
          : 'opacity-100 scale-100 translate-y-0'
      }`}
      style={{
        animation: !toast.isExiting ? 'toast-slide-fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none',
      }}
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className={`flex-shrink-0 ${iconStyles[toast.type]}`}>
        {icons[toast.type]}
      </span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar - hidden when reduced motion is preferred or duration is 0 (infinite) */}
      {!prefersReducedMotion && shouldAutoDismiss && (
        <div
          className={`absolute bottom-0 left-0 h-1 opacity-30 rounded-r-full ${progressBarStyles[toast.type]}`}
          style={{
            width: `${progress}%`,
            willChange: 'width',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default ToastProvider;

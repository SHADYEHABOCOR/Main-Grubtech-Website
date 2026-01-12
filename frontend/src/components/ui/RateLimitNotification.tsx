import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Clock } from 'lucide-react';
import type { RateLimitInfo } from '../../config/api';

interface RateLimitNotificationProps {
  info: RateLimitInfo | null;
  onDismiss: () => void;
}

export const RateLimitNotification: React.FC<RateLimitNotificationProps> = ({
  info,
  onDismiss,
}) => {
  const [countdown, setCountdown] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (info) {
      setCountdown(info.retryAfter);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [info]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for animation
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  if (!info) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] max-w-md transition-all duration-300 ease-in-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-amber-800">
                Rate Limit Exceeded
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                {info.message}
              </p>
              {countdown > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-amber-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Try again in {formatTime(countdown)}
                  </span>
                </div>
              )}
              {countdown === 0 && (
                <p className="mt-2 text-sm text-green-600 font-medium">
                  You can try again now
                </p>
              )}
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-md text-amber-500 hover:text-amber-700 hover:bg-amber-100 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        {countdown > 0 && (
          <div className="h-1 bg-amber-100">
            <div
              className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
              style={{
                width: `${(countdown / (info.retryAfter || 1)) * 100}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RateLimitNotification;

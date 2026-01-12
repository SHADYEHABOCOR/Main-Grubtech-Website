import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/**
 * Offline Indicator Component
 *
 * Displays a banner when the user loses internet connection and a brief
 * notification when the connection is restored.
 *
 * Features:
 * - Fixed position at top of screen
 * - Smooth slide-in/out animations
 * - Shows offline duration when reconnected
 * - Auto-dismisses reconnection message after 5 seconds
 * - Accessible with ARIA attributes
 */
export function OfflineIndicator() {
  const { isOnline, wasOffline, offlineDuration } = useOnlineStatus();

  // Don't render anything if online and wasn't recently offline
  if (isOnline && !wasOffline) {
    return null;
  }

  // Format offline duration for display
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-[9999] transition-transform duration-300 ease-out"
      style={{
        transform: isOnline && !wasOffline ? 'translateY(-100%)' : 'translateY(0)',
      }}
    >
      {!isOnline ? (
        // Offline banner - red/warning style
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            {/* Offline icon */}
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>

            <div className="text-sm font-medium">
              <span className="font-semibold">You're offline.</span>
              <span className="hidden sm:inline ml-1">
                Check your internet connection. Some features may be unavailable.
              </span>
            </div>

            {/* Pulsing dot indicator */}
            <span className="relative flex h-2 w-2 ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-200"></span>
            </span>
          </div>
        </div>
      ) : wasOffline ? (
        // Reconnected banner - green/success style
        <div className="bg-green-600 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            {/* Checkmark icon */}
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <div className="text-sm font-medium">
              <span className="font-semibold">You're back online!</span>
              {offlineDuration && offlineDuration > 0 && (
                <span className="hidden sm:inline ml-1">
                  You were offline for {formatDuration(offlineDuration)}.
                </span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default OfflineIndicator;

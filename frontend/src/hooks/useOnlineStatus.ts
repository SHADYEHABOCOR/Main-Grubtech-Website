import { useState, useEffect, useCallback } from 'react';

/**
 * Online status information
 */
export interface OnlineStatus {
  /** Whether the browser is currently online */
  isOnline: boolean;
  /** Whether the connection was recently restored (for showing reconnection message) */
  wasOffline: boolean;
  /** Timestamp when the connection status last changed */
  lastChanged: Date | null;
  /** How long the user was offline (in seconds) */
  offlineDuration: number | null;
}

/**
 * Hook to detect and track online/offline status
 *
 * Features:
 * - Detects browser online/offline events
 * - Tracks if connection was recently restored
 * - Calculates offline duration
 * - Auto-clears "was offline" state after reconnection
 *
 * @example
 * const { isOnline, wasOffline } = useOnlineStatus();
 *
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 *
 * if (wasOffline) {
 *   return <ReconnectedBanner />;
 * }
 */
export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize with current browser status
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [wasOffline, setWasOffline] = useState(false);
  const [lastChanged, setLastChanged] = useState<Date | null>(null);
  const [offlineStartTime, setOfflineStartTime] = useState<Date | null>(null);
  const [offlineDuration, setOfflineDuration] = useState<number | null>(null);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setLastChanged(new Date());

    // Calculate how long user was offline
    if (offlineStartTime) {
      const duration = Math.round((Date.now() - offlineStartTime.getTime()) / 1000);
      setOfflineDuration(duration);
      setOfflineStartTime(null);
    }

    // Mark that connection was restored
    setWasOffline(true);

    // Clear "was offline" status after 5 seconds
    setTimeout(() => {
      setWasOffline(false);
      setOfflineDuration(null);
    }, 5000);
  }, [offlineStartTime]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setLastChanged(new Date());
    setOfflineStartTime(new Date());
    setWasOffline(false);
  }, []);

  useEffect(() => {
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync initial state (in case it changed before React mounted)
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    isOnline,
    wasOffline,
    lastChanged,
    offlineDuration,
  };
}

/**
 * Simplified hook that just returns online status boolean
 * Use this when you only need basic online/offline detection
 *
 * @example
 * const isOnline = useIsOnline();
 */
export function useIsOnline(): boolean {
  const { isOnline } = useOnlineStatus();
  return isOnline;
}

export default useOnlineStatus;

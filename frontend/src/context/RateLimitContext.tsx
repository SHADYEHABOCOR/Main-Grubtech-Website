import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { setRateLimitHandler, RateLimitInfo } from '../config/api';
import { RateLimitNotification } from '../components/ui/RateLimitNotification';

interface RateLimitContextType {
  rateLimitInfo: RateLimitInfo | null;
  isRateLimited: boolean;
  clearRateLimit: () => void;
}

const RateLimitContext = createContext<RateLimitContextType | undefined>(undefined);

interface RateLimitProviderProps {
  children: ReactNode;
}

export const RateLimitProvider: React.FC<RateLimitProviderProps> = ({ children }) => {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);

  const handleRateLimit = useCallback((info: RateLimitInfo) => {
    setRateLimitInfo(info);
  }, []);

  const clearRateLimit = useCallback(() => {
    setRateLimitInfo(null);
  }, []);

  useEffect(() => {
    // Register the rate limit handler with the API client
    setRateLimitHandler(handleRateLimit);

    // Cleanup on unmount
    return () => {
      setRateLimitHandler(null);
    };
  }, [handleRateLimit]);

  // Auto-dismiss after countdown completes + a small buffer
  useEffect(() => {
    if (rateLimitInfo) {
      const timeout = setTimeout(() => {
        clearRateLimit();
      }, (rateLimitInfo.retryAfter + 5) * 1000); // Dismiss 5 seconds after retry is allowed

      return () => clearTimeout(timeout);
    }
  }, [rateLimitInfo, clearRateLimit]);

  const value: RateLimitContextType = {
    rateLimitInfo,
    isRateLimited: rateLimitInfo !== null,
    clearRateLimit,
  };

  return (
    <RateLimitContext.Provider value={value}>
      {children}
      <RateLimitNotification info={rateLimitInfo} onDismiss={clearRateLimit} />
    </RateLimitContext.Provider>
  );
};

export const useRateLimit = (): RateLimitContextType => {
  const context = useContext(RateLimitContext);
  if (context === undefined) {
    throw new Error('useRateLimit must be used within a RateLimitProvider');
  }
  return context;
};

export default RateLimitProvider;

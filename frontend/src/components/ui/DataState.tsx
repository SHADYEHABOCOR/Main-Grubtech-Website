import React from 'react';
import { AlertCircle, RefreshCw, Inbox, Loader2, WifiOff, ServerOff } from 'lucide-react';
import { useIsOnline } from '../../hooks/useOnlineStatus';
import { getErrorMessage as sanitizeError } from '../../utils/errorMessages';

/**
 * Props for the DataState component
 */
interface DataStateProps {
  /** Whether data is currently loading */
  isLoading?: boolean;
  /** Whether there was an error loading data */
  isError?: boolean;
  /** The error object or message */
  error?: Error | string | null;
  /** Whether the data array/object is empty */
  isEmpty?: boolean;
  /** The actual content to render when data is available */
  children: React.ReactNode;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode;
  /** Custom empty state component */
  emptyComponent?: React.ReactNode;
  /** Callback to retry the failed request */
  onRetry?: () => void;
  /** Custom messages */
  messages?: {
    loading?: string;
    error?: string;
    empty?: string;
    offline?: string;
  };
  /** Size variant */
  variant?: 'compact' | 'default' | 'full-page';
  /** Whether to show skeleton loading instead of spinner */
  skeleton?: React.ReactNode;
}

/**
 * DataState Component
 *
 * A reusable component that handles loading, error, and empty states
 * for data-fetching scenarios. Provides consistent UI across the app.
 *
 * @example
 * <DataState
 *   isLoading={isLoading}
 *   isError={isError}
 *   error={error}
 *   isEmpty={data.length === 0}
 *   onRetry={refetch}
 * >
 *   <BlogList posts={data} />
 * </DataState>
 */
export const DataState: React.FC<DataStateProps> = ({
  isLoading = false,
  isError = false,
  error = null,
  isEmpty = false,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  onRetry,
  messages = {},
  variant = 'default',
  skeleton,
}) => {
  const isOnline = useIsOnline();

  const defaultMessages = {
    loading: messages.loading || 'Loading...',
    error: messages.error || 'Something went wrong. Please try again.',
    empty: messages.empty || 'No data available.',
    offline: messages.offline || 'You appear to be offline. Please check your connection.',
  };

  // Determine container classes based on variant
  const containerClasses = {
    compact: 'py-6',
    default: 'py-12',
    'full-page': 'min-h-[50vh] flex items-center justify-center py-16',
  };

  // Loading state
  if (isLoading) {
    if (skeleton) {
      return <>{skeleton}</>;
    }
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div className={`${containerClasses[variant]} text-center`}>
        <LoadingState message={defaultMessages.loading} />
      </div>
    );
  }

  // Error state (check offline first)
  if (isError) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    const isOfflineError = !isOnline || (error instanceof Error && (
      error.message.includes('network') ||
      error.message.includes('Network') ||
      error.message.includes('offline') ||
      error.message.includes('Failed to fetch')
    ));

    return (
      <div className={`${containerClasses[variant]} text-center`}>
        {isOfflineError ? (
          <OfflineState message={defaultMessages.offline} onRetry={onRetry} />
        ) : (
          <ErrorState
            message={getErrorMessage(error) || defaultMessages.error}
            onRetry={onRetry}
          />
        )}
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    return (
      <div className={`${containerClasses[variant]} text-center`}>
        <EmptyState message={defaultMessages.empty} />
      </div>
    );
  }

  // Normal state - render children
  return <>{children}</>;
};

/**
 * Loading State Component
 */
interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className={`${sizeClasses[size]} text-primary animate-spin`} />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
};

/**
 * Error State Component
 */
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  showIcon?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  showIcon = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
      {showIcon && (
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <ServerOff className="w-8 h-8 text-red-500" />
        </div>
      )}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to Load</h3>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

/**
 * Offline State Component
 */
interface OfflineStateProps {
  message?: string;
  onRetry?: () => void;
}

export const OfflineState: React.FC<OfflineStateProps> = ({
  message = 'You appear to be offline. Please check your connection.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
        <WifiOff className="w-8 h-8 text-yellow-600" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Connection</h3>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
};

/**
 * Empty State Component
 */
interface EmptyStateProps {
  message?: string;
  title?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No data available.',
  title = 'Nothing Here',
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
        {icon || <Inbox className="w-8 h-8 text-gray-400" />}
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * Inline Error Component - for smaller inline error messages
 */
interface InlineErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message = 'Failed to load',
  onRetry,
}) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-700 flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-red-700 hover:text-red-800 flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
};

/**
 * Helper function to extract and sanitize error message
 * Uses the centralized error sanitization utility to prevent
 * exposure of technical details, stack traces, or sensitive information
 */
function getErrorMessage(error: Error | string | null | undefined): string {
  if (!error) return '';
  // Use sanitized error message to prevent exposing technical details
  return sanitizeError(error);
}

export default DataState;

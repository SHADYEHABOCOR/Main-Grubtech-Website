import { useState, useEffect } from 'react';
import { getErrorMessage } from '../utils/errorMessages';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchOptions {
  skip?: boolean;
  deps?: unknown[];
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions = {}
): UseFetchState<T> & { refetch: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      // Use sanitized error message to prevent exposing technical details
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!options.skip) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, options.deps || []);

  return { data, loading, error, refetch: fetchData };
}

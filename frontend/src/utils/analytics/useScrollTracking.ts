import { useEffect, useRef } from 'react';
import { analytics } from './analytics';

/**
 * Hook to track scroll depth
 * Fires events at 25%, 50%, 75%, and 100% scroll depth
 */
export const useScrollTracking = () => {
  const tracked = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);

      // Track milestones
      const milestones = [25, 50, 75, 100] as const;

      for (const milestone of milestones) {
        if (scrollPercentage >= milestone && !tracked.current.has(milestone)) {
          tracked.current.add(milestone);
          analytics.trackScrollDepth(milestone);
        }
      }
    };

    // Debounce scroll event
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
};

/**
 * Hook to track time on page
 * Fires events at 30s, 60s, and 120s intervals
 */
export const useTimeTracking = () => {
  const tracked = useRef<Set<number>>(new Set());

  useEffect(() => {
    const intervals = [
      { time: 30000, event: 'time_on_page_30s' },
      { time: 60000, event: 'time_on_page_60s' },
      { time: 120000, event: 'time_on_page_120s' },
    ] as const;

    const timers = intervals.map(({ time, event }) =>
      setTimeout(() => {
        if (!tracked.current.has(time)) {
          tracked.current.add(time);
          analytics.track(event, {
            page_path: window.location.pathname,
            time_spent: time / 1000,
          });
        }
      }, time)
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);
};

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export const useLenis = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Use autoRaf for optimized RAF handling - stops when not scrolling
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
      infinite: false,
      autoRaf: true, // Optimized: automatically handles RAF, stops when idle
    });

    lenisRef.current = lenis;

    // Expose lenis instance globally for scroll-to functionality
    window.lenis = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      window.lenis = null;
    };
  }, []);

  return lenisRef;
};

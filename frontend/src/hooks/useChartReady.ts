import { useState, useLayoutEffect } from 'react';

/**
 * Chart Ready Hook
 *
 * Defers chart rendering until the container has proper dimensions.
 * This prevents rendering issues with responsive charts (like Recharts)
 * that need valid container dimensions to render correctly.
 *
 * Uses ResizeObserver to detect when the container has valid dimensions,
 * with fallback timeout logic to ensure charts eventually render even if
 * ResizeObserver doesn't fire.
 *
 * @param containerRef - React ref to the chart container element
 * @returns boolean - true when the container is ready for chart rendering
 *
 * @example
 * // Basic usage with Recharts
 * function SalesChart() {
 *   const chartContainerRef = useRef<HTMLDivElement>(null);
 *   const isChartReady = useChartReady(chartContainerRef);
 *
 *   return (
 *     <div ref={chartContainerRef} className="h-[300px] w-full">
 *       {isChartReady && (
 *         <ResponsiveContainer width="100%" height="100%">
 *           <LineChart data={data}>
 *             {/* chart components *\/}
 *           </LineChart>
 *         </ResponsiveContainer>
 *       )}
 *     </div>
 *   );
 * }
 *
 * @example
 * // With multiple charts
 * function Dashboard() {
 *   const barChartRef = useRef<HTMLDivElement>(null);
 *   const lineChartRef = useRef<HTMLDivElement>(null);
 *   const isBarChartReady = useChartReady(barChartRef);
 *   const isLineChartReady = useChartReady(lineChartRef);
 *
 *   return (
 *     <>
 *       <div ref={barChartRef} className="h-[280px]">
 *         {isBarChartReady && <BarChart data={barData} />}
 *       </div>
 *       <div ref={lineChartRef} className="h-[200px]">
 *         {isLineChartReady && <LineChart data={lineData} />}
 *       </div>
 *     </>
 *   );
 * }
 */
export function useChartReady(containerRef: React.RefObject<HTMLDivElement>): boolean {
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    if (!containerRef.current) {
      // No ref yet, use timeout fallback
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }

    const element = containerRef.current;
    const rect = element.getBoundingClientRect();

    // If already has valid dimensions, render immediately
    if (rect.width > 0 && rect.height > 0) {
      setIsReady(true);
      return;
    }

    // Otherwise, wait for ResizeObserver to report valid dimensions
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsReady(true);
          observer.disconnect();
        }
      }
    });

    observer.observe(element);

    // Fallback timeout in case ResizeObserver doesn't fire
    const timer = setTimeout(() => {
      setIsReady(true);
      observer.disconnect();
    }, 200);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [containerRef]);

  return isReady;
}

export default useChartReady;

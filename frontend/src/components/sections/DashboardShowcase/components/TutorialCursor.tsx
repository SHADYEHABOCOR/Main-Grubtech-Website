import React, { useState, useEffect, useCallback } from 'react';
import { MousePointer2 } from 'lucide-react';
import type { TutorialStep } from '../types';

interface TutorialCursorProps {
  /** Array of tutorial steps to display */
  steps: TutorialStep[];
  /** Whether the tutorial animation is playing */
  isPlaying: boolean;
  /** Reference to the container element for positioning calculations */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Whether to reduce motion for accessibility */
  prefersReducedMotion: boolean;
  /** Scale factor applied to the dashboard container (default: 1) */
  scale?: number;
}

/**
 * TutorialCursor component displays an interactive tutorial overlay with an animated cursor
 * that moves to different elements and shows explanatory tooltips.
 *
 * The component uses actual DOM element positions (via data-tutorial-target attributes)
 * to position the cursor accurately. It includes animation logic for smooth transitions
 * between steps and handles tooltip positioning based on screen position.
 *
 * @example
 * <TutorialCursor
 *   steps={homeTutorialSteps}
 *   isPlaying={true}
 *   containerRef={dashboardContainerRef}
 *   prefersReducedMotion={false}
 * />
 */
export const TutorialCursor: React.FC<TutorialCursorProps> = ({
  steps,
  isPlaying,
  containerRef,
  prefersReducedMotion,
  scale = 1,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [isOnRightSide, setIsOnRightSide] = useState(false);

  // Function to find element and get its position relative to container
  const getElementPosition = useCallback(
    (target: string) => {
      if (!containerRef.current) return null;

      const element = containerRef.current.querySelector(
        `[data-tutorial-target="${target}"]`
      );
      if (!element) return null;

      const containerRect = containerRef.current.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Calculate position relative to container, accounting for scale
      // The container is scaled, so we need to get the position in the scaled coordinate system
      const x = (elementRect.left - containerRect.left) / scale + elementRect.width / 2;
      const y = (elementRect.top - containerRect.top) / scale + elementRect.height / 2;

      // Check if element is on right side of container (using unscaled width)
      const containerWidth = containerRect.width / scale;
      const isRight = x > containerWidth * 0.65;

      return { x, y, isRight };
    },
    [containerRef, scale]
  );

  // Reset index when steps change
  useEffect(() => {
    setCurrentStepIndex(0);
    setShowTooltip(false);
  }, [steps]);

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    // Ensure currentStepIndex is within bounds
    const safeIndex = currentStepIndex >= steps.length ? 0 : currentStepIndex;
    if (safeIndex !== currentStepIndex) {
      setCurrentStepIndex(safeIndex);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let tooltipTimeoutId: NodeJS.Timeout;

    const runStep = () => {
      const step = steps[safeIndex];
      if (!step) return;

      // Get actual element position
      const pos = getElementPosition(step.target);
      if (pos) {
        setPosition({ x: pos.x, y: pos.y });
        setIsOnRightSide(pos.isRight);
      }

      setShowTooltip(false);

      tooltipTimeoutId = setTimeout(() => {
        setShowTooltip(true);
      }, 800);

      const stepDuration = step.delay || 3500;
      timeoutId = setTimeout(() => {
        setCurrentStepIndex((prev) => (prev + 1) % steps.length);
      }, stepDuration);
    };

    runStep();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(tooltipTimeoutId);
    };
  }, [currentStepIndex, isPlaying, steps, getElementPosition]);

  if (!isPlaying || steps.length === 0) return null;

  // Safe access with fallback
  const currentStep = steps[currentStepIndex] || steps[0];
  if (!currentStep) return null;

  const currentText = currentStep.text;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className={`absolute flex flex-col items-start ${
          !prefersReducedMotion ? 'transition-all duration-1000 ease-out' : ''
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-5px, -5px)',
        }}
      >
        <div className="relative">
          <div className="absolute -inset-2 bg-blue-500/20 rounded-full opacity-60"></div>
          <MousePointer2
            className="w-6 h-6 text-black drop-shadow-lg fill-white relative z-10"
            strokeWidth={1.5}
          />
        </div>

        <div
          className={`
            mt-3 px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-xl border border-slate-700
            transform max-w-[200px]
            ${!prefersReducedMotion ? 'transition-all duration-500' : ''}
            ${
              isOnRightSide
                ? '-ml-52 origin-top-right'
                : 'ml-4 origin-top-left'
            }
            ${
              showTooltip
                ? 'opacity-100 scale-100 translate-y-0'
                : !prefersReducedMotion
                ? 'opacity-0 scale-95 -translate-y-2'
                : 'opacity-0'
            }
          `}
        >
          <div
            className={`absolute -top-1 w-2 h-2 bg-slate-900 rotate-45 border-t border-l border-slate-700 ${
              isOnRightSide ? 'right-3' : 'left-2.5'
            }`}
          ></div>
          {currentText}
        </div>
      </div>
    </div>
  );
};

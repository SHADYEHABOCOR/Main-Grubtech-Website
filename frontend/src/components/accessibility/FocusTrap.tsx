import React, { useEffect, useRef, useCallback } from 'react';

interface FocusTrapProps {
  /** Whether the focus trap is active */
  active?: boolean;
  /** Children to render inside the focus trap */
  children: React.ReactNode;
  /** Callback when escape key is pressed */
  onEscape?: () => void;
  /** Whether to restore focus to the previously focused element on unmount */
  restoreFocus?: boolean;
  /** Initial element to focus (selector or 'first') */
  initialFocus?: string | 'first';
}

// Focusable element selectors
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Focus Trap Component
 *
 * Traps keyboard focus within a container. Essential for accessible modals,
 * dialogs, and dropdown menus.
 *
 * @example
 * <FocusTrap active={isOpen} onEscape={onClose}>
 *   <Dialog>...</Dialog>
 * </FocusTrap>
 */
export const FocusTrap: React.FC<FocusTrapProps> = ({
  active = true,
  children,
  onEscape,
  restoreFocus = true,
  initialFocus = 'first',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter((el) => el.offsetParent !== null); // Filter out hidden elements
  }, []);

  // Handle Tab key to trap focus
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!active) return;

      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift + Tab
      if (e.shiftKey) {
        if (activeElement === firstElement || !containerRef.current?.contains(activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab
      else {
        if (activeElement === lastElement || !containerRef.current?.contains(activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [active, onEscape, getFocusableElements]
  );

  // Set initial focus when trap becomes active
  useEffect(() => {
    if (!active) return;

    // Store the currently focused element
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    // Set initial focus
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      if (initialFocus === 'first') {
        focusableElements[0].focus();
      } else {
        const target = containerRef.current?.querySelector<HTMLElement>(initialFocus);
        if (target) {
          target.focus();
        } else {
          focusableElements[0].focus();
        }
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus on cleanup
      if (restoreFocus && previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [active, handleKeyDown, getFocusableElements, initialFocus, restoreFocus]);

  return (
    <div ref={containerRef} data-focus-trap={active ? 'active' : 'inactive'}>
      {children}
    </div>
  );
};

export default FocusTrap;

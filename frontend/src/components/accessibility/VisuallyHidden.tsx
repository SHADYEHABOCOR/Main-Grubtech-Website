import React from 'react';

interface VisuallyHiddenProps {
  /** Content to hide visually but keep accessible to screen readers */
  children: React.ReactNode;
  /** HTML element to render */
  as?: 'span' | 'div' | 'p' | 'label';
}

/**
 * Visually Hidden Component
 *
 * Hides content visually while keeping it accessible to screen readers.
 * Use this for providing additional context to assistive technology users.
 *
 * @example
 * <button>
 *   <Icon />
 *   <VisuallyHidden>Close menu</VisuallyHidden>
 * </button>
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as: Component = 'span',
}) => {
  return <Component className="sr-only">{children}</Component>;
};

export default VisuallyHidden;

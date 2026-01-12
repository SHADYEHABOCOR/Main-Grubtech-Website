import React from 'react';

interface SkipLinkProps {
  /** Target element ID to skip to */
  targetId?: string;
  /** Link text */
  children?: React.ReactNode;
}

/**
 * Skip Link Component
 *
 * Provides keyboard users a way to skip navigation and go directly to main content.
 * The link is visually hidden until focused, then appears at the top of the page.
 *
 * @example
 * <SkipLink targetId="main-content">Skip to main content</SkipLink>
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  children = 'Skip to main content',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
        focus:px-4 focus:py-3
        focus:bg-primary focus:text-white
        focus:rounded-lg focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary
        font-semibold text-sm
        transition-all duration-200
      "
    >
      {children}
    </a>
  );
};

export default SkipLink;

import React, { lazy, Suspense, ComponentProps } from 'react';

// Lazy load framer-motion components
const MotionDiv = lazy(() =>
  import('framer-motion').then(module => ({
    default: module.motion.div
  }))
);

const AnimatePresenceComponent = lazy(() =>
  import('framer-motion').then(module => ({
    default: module.AnimatePresence
  }))
);

/**
 * Lazy-loaded wrapper for motion.div to improve initial bundle size.
 * The framer-motion library is only loaded when this component is rendered.
 */
export const LazyMotionDiv: React.FC<ComponentProps<typeof MotionDiv>> = (props) => {
  return (
    <Suspense fallback={<div {...(props as any)} />}>
      <MotionDiv {...props} />
    </Suspense>
  );
};

/**
 * Lazy-loaded wrapper for AnimatePresence to improve initial bundle size.
 * The framer-motion library is only loaded when this component is rendered.
 */
export const LazyAnimatePresence: React.FC<ComponentProps<typeof AnimatePresenceComponent>> = (props) => {
  return (
    <Suspense fallback={<>{props.children}</>}>
      <AnimatePresenceComponent {...props} />
    </Suspense>
  );
};

// Export a motion object for convenience with lazy-loaded components
export const motion = {
  div: LazyMotionDiv,
};

// Export AnimatePresence as default export name
export const AnimatePresence = LazyAnimatePresence;

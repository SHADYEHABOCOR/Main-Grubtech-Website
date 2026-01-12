import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const CustomCursor = () => {
  const location = useLocation();
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [targetPosition, setTargetPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  // Don't show custom cursor on admin pages
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return null;
  }

  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;

    const updateCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setTargetPosition({ x: mouseX, y: mouseY });

      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.closest('[role="button"]') !== null ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsPointer(isInteractive);
    };

    const animate = () => {
      setPosition((prev) => ({
        x: prev.x + (mouseX - prev.x) * 0.5,
        y: prev.y + (mouseY - prev.y) * 0.5,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };

    const handleMouseEnter = () => setIsHidden(false);
    const handleMouseLeave = () => setIsHidden(true);

    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Smooth following cursor */}
      <div
        ref={cursorRef}
        className={`custom-cursor ${isPointer ? 'cursor-hover' : ''} ${isHidden ? 'cursor-hidden' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />

      {/* Instant following dot */}
      <div
        className={`custom-cursor-dot ${isHidden ? 'cursor-hidden' : ''}`}
        style={{
          left: `${targetPosition.x}px`,
          top: `${targetPosition.y}px`,
        }}
      />
    </>
  );
};

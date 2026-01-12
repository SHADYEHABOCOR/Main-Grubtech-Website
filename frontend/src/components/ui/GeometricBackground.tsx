import React from 'react';

export const GeometricBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large Circle - Top Right */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary opacity-[0.03]"
        style={{ transform: 'rotate(45deg)' }}
      />

      {/* Medium Circle - Bottom Left */}
      <div
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary-light opacity-[0.04]"
      />

      {/* Small Circle - Middle Right */}
      <div
        className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-primary-dark opacity-[0.02]"
      />

      {/* Square - Bottom Right */}
      <div
        className="absolute bottom-40 right-1/4 w-48 h-48 bg-primary opacity-[0.02]"
        style={{ transform: 'rotate(25deg)' }}
      />

      {/* Small Square - Middle Left */}
      <div
        className="absolute top-1/2 left-20 w-32 h-32 bg-primary-light opacity-[0.03]"
        style={{ transform: 'rotate(-15deg)' }}
      />

      {/* Hexagon - Center Right */}
      <div
        className="absolute top-2/3 right-40 opacity-[0.025]"
        style={{
          width: '100px',
          height: '57.735px',
          background: 'rgb(13, 71, 192)',
          position: 'relative',
        }}
      >
        <div
          style={{
            content: '',
            position: 'absolute',
            width: 0,
            borderLeft: '50px solid transparent',
            borderRight: '50px solid transparent',
            bottom: '100%',
            borderBottom: '28.8675px solid rgb(13, 71, 192)',
          }}
        />
        <div
          style={{
            content: '',
            position: 'absolute',
            width: 0,
            borderLeft: '50px solid transparent',
            borderRight: '50px solid transparent',
            top: '100%',
            borderTop: '28.8675px solid rgb(13, 71, 192)',
          }}
        />
      </div>

      {/* Tiny Circles scattered */}
      <div className="absolute top-1/4 left-1/3 w-12 h-12 rounded-full bg-primary opacity-[0.02]" />
      <div className="absolute top-3/4 left-2/3 w-16 h-16 rounded-full bg-primary-light opacity-[0.025]" />
      <div className="absolute top-1/2 right-1/3 w-10 h-10 rounded-full bg-primary-dark opacity-[0.02]" />

      {/* Lines/Rectangles */}
      <div
        className="absolute top-40 right-1/3 w-2 h-40 bg-primary opacity-[0.02]"
        style={{ transform: 'rotate(45deg)' }}
      />
      <div
        className="absolute bottom-1/3 left-1/4 w-1 h-32 bg-primary-light opacity-[0.025]"
        style={{ transform: 'rotate(-30deg)' }}
      />
    </div>
  );
};

import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: 'text' | 'circle' | 'card';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height,
  variant = 'text',
  className = ''
}) => {
  let defaultHeight: string | undefined;
  let variantStyles: string;

  switch (variant) {
    case 'circle':
      variantStyles = 'rounded-full';
      defaultHeight = height || '40px';
      break;
    case 'card':
      variantStyles = 'rounded-xl border border-cyber-border/40';
      defaultHeight = height || '150px';
      break;
    case 'text':
    default:
      variantStyles = 'rounded-md';
      defaultHeight = height || '16px';
  }

  return (
    <div
      className={`relative overflow-hidden bg-white/[0.03] animate-pulse ${variantStyles} ${className}`}
      style={{ width, height: defaultHeight }}
    >
      {/* Absolute overlay shimmer effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
        style={{
          transform: 'translateX(-100%)',
          animation: 'shimmer 1.6s infinite'
        }}
      />

      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

import React from 'react';
import { cn } from '../../utils';

export interface FadeProps {
  children: React.ReactNode;
  visible: boolean;
  duration?: number;
  className?: string;
}

export const Fade: React.FC<FadeProps> = ({
  children,
  visible,
  duration = 200,
  className,
}) => {
  return (
    <div
      className={cn(
        'transition-opacity',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
      aria-hidden={!visible}
    >
      {children}
    </div>
  );
};

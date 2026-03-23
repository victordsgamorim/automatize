import React from 'react';
import { cn } from '../../utils';

export interface AnimateInProps {
  children: React.ReactNode;
  delay?: number;
  type?: 'fadeSlideIn' | 'slideRightIn' | 'testimonialIn';
  className?: string;
}

export const AnimateIn: React.FC<AnimateInProps> = ({
  children,
  delay = 0,
  type = 'fadeSlideIn',
  className,
}) => {
  const typeClass =
    type === 'fadeSlideIn'
      ? 'animate-fade-in'
      : type === 'slideRightIn'
        ? 'animate-slide-right'
        : type === 'testimonialIn'
          ? 'animate-testimonial'
          : 'animate-fade-in';

  const delayClass = delay > 0 ? `animate-delay-${delay}` : '';

  return <div className={cn(typeClass, delayClass, className)}>{children}</div>;
};

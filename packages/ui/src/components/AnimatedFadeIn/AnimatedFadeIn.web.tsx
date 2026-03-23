import React from 'react';
import { cn } from '../../utils';

export interface AnimatedFadeInProps {
  children: React.ReactNode;
  delay?: number;
  type?: 'fadeSlideIn' | 'slideRightIn' | 'testimonialIn';
  className?: string;
}

export const AnimatedFadeIn: React.FC<AnimatedFadeInProps> = ({
  children,
  delay = 0,
  type = 'fadeSlideIn',
  className,
}) => {
  const typeClass =
    type === 'fadeSlideIn'
      ? 'animate-element'
      : type === 'slideRightIn'
        ? 'animate-slide-right'
        : type === 'testimonialIn'
          ? 'animate-testimonial'
          : 'animate-element';

  const delayClass = delay > 0 ? `animate-delay-${delay}` : '';

  return <div className={cn(typeClass, delayClass, className)}>{children}</div>;
};

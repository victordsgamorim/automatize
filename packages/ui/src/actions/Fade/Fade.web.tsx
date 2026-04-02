import React from 'react';
import { cn } from '../../utils';

export interface FadeProps {
  children: React.ReactNode;
  /**
   * Controls visibility. Defaults to `true`.
   * - When `true`: element is visible (opacity-100).
   * - When `false`: element is hidden (opacity-0, pointer-events-none).
   */
  visible?: boolean;
  /** Staggered entrance delay in ms (only applies on mount via CSS class). */
  delay?: number;
  /** Entrance animation type (CSS class-based). */
  type?: 'fadeSlideIn' | 'slideRightIn' | 'testimonialIn';
  /** Transition duration in ms for visibility toggle (default 200). */
  duration?: number;
  className?: string;
}

const typeClasses: Record<NonNullable<FadeProps['type']>, string> = {
  fadeSlideIn: 'animate-element',
  slideRightIn: 'animate-slide-right',
  testimonialIn: 'animate-testimonial',
};

export const Fade: React.FC<FadeProps> = ({
  children,
  visible = true,
  delay = 0,
  type = 'fadeSlideIn',
  duration = 200,
  className,
}) => {
  const typeClass = typeClasses[type];
  const delayClass = delay > 0 ? `animate-delay-${delay}` : '';

  return (
    <div
      className={cn(
        typeClass,
        delayClass,
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

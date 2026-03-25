'use client';

import React from 'react';
import { cn } from '../../utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content of the card */
  children: React.ReactNode;
  /** Card padding */
  padding?: 'sm' | 'md' | 'lg';
  /** Elevation level (0-3) */
  elevation?: 0 | 1 | 2 | 3;
}

const paddingMap = {
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
} as const;

const elevationMap = {
  0: '',
  1: 'shadow-sm',
  2: 'shadow',
  3: 'shadow-md',
} as const;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, padding = 'md', elevation = 1, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card"
        className={cn(
          'rounded-lg bg-card text-card-foreground overflow-hidden border border-border/50',
          paddingMap[padding],
          elevationMap[elevation],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

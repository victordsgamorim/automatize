'use client';

/**
 * Loading / Skeleton Components — Web
 */

import * as React from 'react';
import { cn } from '../web/utils';

export interface LoadingProps {
  /** Loading message */
  message?: string;
  /** Size of the spinner */
  size?: 'small' | 'large';
  /** Full page loader */
  fullScreen?: boolean;
  className?: string;
}

export const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ message, size = 'large', fullScreen = false, className }, ref) => {
    const spinnerSize = size === 'large' ? 'size-8' : 'size-5';
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-3',
          fullScreen ? 'fixed inset-0 bg-background/80 z-50' : 'p-5',
          className
        )}
        role="status"
        aria-label={message ?? 'Loading'}
      >
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-muted border-t-primary',
            spinnerSize
          )}
          aria-hidden="true"
        />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    );
  }
);

Loading.displayName = 'Loading';

export interface SkeletonProps extends React.ComponentProps<'div'> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="skeleton"
        className={cn('bg-accent animate-pulse rounded-md', className)}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };

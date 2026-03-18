'use client';

/**
 * ErrorState Composite
 * Generic error state component with optional retry action
 */

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading your data. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div
        className="rounded-full bg-[var(--destructive)]/10 p-6 mb-4"
        aria-hidden="true"
      >
        <AlertCircle className="size-10 text-[var(--destructive)]" />
      </div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="size-4 mr-2" aria-hidden="true" />
          Try Again
        </Button>
      )}
    </div>
  );
}

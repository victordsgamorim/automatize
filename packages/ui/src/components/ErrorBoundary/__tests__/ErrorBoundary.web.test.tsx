import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { ErrorInfo } from 'react';

import { ErrorBoundary, RootErrorBoundary } from '../ErrorBoundary.web';

function Bomb({ shouldThrow }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <div>Safe content</div>;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ErrorBoundary (web)', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Content')).toBeDefined();
  });

  it('renders default fallback with role="alert" when child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('shows "Something went wrong" heading in default fallback', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeDefined();
  });

  it('renders a "Try Again" button in default fallback', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeDefined();
  });

  it('renders custom fallback when fallback prop is provided', () => {
    const fallback = vi.fn(() => <div>Custom Error UI</div>);
    render(
      <ErrorBoundary fallback={fallback}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(fallback).toHaveBeenCalledOnce();
    expect(screen.getByText('Custom Error UI')).toBeDefined();
  });

  it('passes the thrown Error instance to the custom fallback', () => {
    let capturedError: Error | null = null;
    const fallback = (error: Error, _reset: () => void) => {
      capturedError = error;
      return <div>Error fallback</div>;
    };
    render(
      <ErrorBoundary fallback={fallback}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(capturedError).toBeInstanceOf(Error);
    expect(capturedError!.message).toBe('Test error');
  });

  it('passes a reset function to the custom fallback', () => {
    let capturedReset: (() => void) | null = null;
    const fallback = (_error: Error, reset: () => void) => {
      capturedReset = reset;
      return <button onClick={reset}>Reset</button>;
    };
    render(
      <ErrorBoundary fallback={fallback}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(typeof capturedReset).toBe('function');
  });

  it('calls onError callback with error and errorInfo when child throws', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledOnce();
    const [error, errorInfo] = onError.mock.calls[0] as [Error, ErrorInfo];
    expect(error).toBeInstanceOf(Error);
    expect(errorInfo).toHaveProperty('componentStack');
  });

  it('reset re-triggers child rendering (which may throw again)', () => {
    let resetCallCount = 0;
    const fallback = (_error: Error, reset: () => void) => {
      resetCallCount++;
      return <button onClick={reset}>Reset</button>;
    };
    render(
      <ErrorBoundary fallback={fallback}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(resetCallCount).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    // Bomb still throws after reset, so fallback is invoked again
    expect(resetCallCount).toBe(2);
  });

  it('clicking "Try Again" triggers child re-render (default fallback reset)', () => {
    let onErrorCallCount = 0;
    const onError = vi.fn(() => {
      onErrorCallCount++;
    });
    render(
      <ErrorBoundary onError={onError}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(onErrorCallCount).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    // After reset, Bomb re-throws → onError is called a second time
    expect(onErrorCallCount).toBe(2);
  });
});

describe('RootErrorBoundary (web)', () => {
  it('renders children when no error occurs', () => {
    render(
      <RootErrorBoundary>
        <div>App content</div>
      </RootErrorBoundary>
    );
    expect(screen.getByText('App content')).toBeDefined();
  });

  it('catches errors from children', () => {
    render(
      <RootErrorBoundary>
        <Bomb shouldThrow />
      </RootErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeDefined();
  });
});

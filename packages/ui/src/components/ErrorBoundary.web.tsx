'use client';

/**
 * ErrorBoundary Component — Web
 * Catches errors in the component tree and displays fallback UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[${this.props.name ?? 'ErrorBoundary'}]`,
        error,
        errorInfo
      );
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            minHeight: '200px',
          }}
          role="alert"
        >
          <h2
            style={{
              color: 'var(--destructive, #d4183d)',
              marginBottom: '1rem',
            }}
          >
            Something went wrong
          </h2>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre
              style={{
                background: 'var(--muted, #ececf0)',
                padding: '1rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                maxWidth: '600px',
                overflowX: 'auto',
                marginBottom: '1rem',
              }}
            >
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.reset}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '0.375rem',
              border: '1px solid currentColor',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export interface RootErrorBoundaryProps {
  children: ReactNode;
}

export const RootErrorBoundary = ({ children }: RootErrorBoundaryProps) => (
  <ErrorBoundary
    name="RootErrorBoundary"
    onError={(error, errorInfo) => {
      console.error('Root error caught:', error, errorInfo);
    }}
  >
    {children}
  </ErrorBoundary>
);

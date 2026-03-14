'use client';

/**
 * ErrorBoundary Component
 * Catches errors in the component tree and displays fallback UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../tokens';
import { Text } from './Text.native';
import { Button } from './Button.native';

export interface ErrorBoundaryProps {
  /** Child components */
  children: ReactNode;
  /** Fallback component to display on error */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Called when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Error boundary name for debugging */
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
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call onError callback
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (__DEV__) {
      console.error(
        `[${this.props.name || 'ErrorBoundary'}]`,
        error,
        errorInfo
      );
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text variant="h2" color="error" style={styles.title}>
              Something went wrong
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorSection}>
                <Text
                  variant="caption"
                  color="secondary"
                  style={styles.errorLabel}
                >
                  Error Details:
                </Text>
                <Text
                  variant="code"
                  color="tertiary"
                  style={styles.errorMessage}
                >
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            <View style={styles.message}>
              <Text variant="body" color="secondary">
                {__DEV__
                  ? 'An unexpected error occurred. See details above.'
                  : "We're sorry, but something went wrong. Please try again."}
              </Text>
            </View>

            <Button onPress={this.reset} style={styles.button}>
              Try Again
            </Button>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing[3],
  },
  errorSection: {
    width: '100%',
    backgroundColor: colors.error[50],
    borderRadius: 8,
    padding: spacing[3],
    marginBottom: spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: colors.error[600],
  },
  errorLabel: {
    marginBottom: spacing[1],
    fontWeight: '600',
  },
  errorMessage: {
    color: colors.error[700],
  },
  message: {
    marginBottom: spacing[4],
  },
  button: {
    minWidth: 200,
  },
});

// Global error boundary for the entire app
export interface RootErrorBoundaryProps {
  children: ReactNode;
}

export const RootErrorBoundary = ({ children }: RootErrorBoundaryProps) => {
  return (
    <ErrorBoundary
      name="RootErrorBoundary"
      onError={(error, errorInfo) => {
        // In production, send to error tracking service
        console.error('Root error caught:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

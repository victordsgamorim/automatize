/**
 * Loading Component
 * Loading spinner with optional text
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../tokens';
import { Text } from './Text.native';

export interface LoadingProps {
  /** Loading text to display */
  message?: string;
  /** Size of the spinner */
  size?: 'small' | 'large';
  /** Color of the spinner */
  color?: string;
  /** Full screen loader */
  fullScreen?: boolean;
}

export const Loading = React.forwardRef<View, LoadingProps>(
  (
    { message, size = 'large', color = colors.brand[600], fullScreen = false },
    ref
  ) => {
    const containerStyle = fullScreen
      ? styles.fullScreenContainer
      : styles.container;

    return (
      <View ref={ref} style={containerStyle}>
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text style={styles.message} color="secondary">
            {message}
          </Text>
        )}
      </View>
    );
  }
);

Loading.displayName = 'Loading';

/**
 * Skeleton Loader
 * Placeholder component for loading states
 */
export interface SkeletonProps {
  /** Width of skeleton */
  width?: number | string;
  /** Height of skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Animated (not yet implemented) */
  animated?: boolean;
}

export const Skeleton = React.forwardRef<View, SkeletonProps>(
  (
    { width, height = 20, borderRadius = 4, animated: _animated = true },
    ref
  ) => {
    // Handle width: "100%" converts to device width, numeric width is used as-is
    let resolvedWidth: number | undefined;
    if (typeof width === 'string' && width === '100%') {
      resolvedWidth = Dimensions.get('window').width;
    } else if (typeof width === 'number') {
      resolvedWidth = width;
    }

    return (
      <View
        ref={ref}
        style={[
          styles.skeleton,
          {
            ...(resolvedWidth !== undefined && { width: resolvedWidth }),
            height,
            borderRadius,
            backgroundColor: colors.neutral[200],
          },
        ]}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
  message: {
    marginTop: 16,
  },
  skeleton: {
    overflow: 'hidden',
  },
});

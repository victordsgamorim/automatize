import { useFocusEffect as expoUseFocusEffect } from 'expo-router';

/**
 * Native implementation of `useFocusEffect`.
 *
 * Delegates directly to Expo Router's `useFocusEffect` which fires
 * the callback when the screen gains focus and runs the cleanup
 * when it loses focus.
 */
export function useFocusEffect(callback: () => void | (() => void)): void {
  // Expo Router re-exports React Navigation's useFocusEffect.
  // The callback contract is identical to our public API.
  expoUseFocusEffect(callback as () => void);
}

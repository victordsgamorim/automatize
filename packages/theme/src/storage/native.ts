import type { ThemePreference, ThemeStorageAdapter } from '../types';

const VALID_PREFERENCES: ThemePreference[] = ['light', 'dark', 'system'];

/**
 * Creates a storage adapter using AsyncStorage (React Native).
 * Requires @react-native-async-storage/async-storage as a peer dependency.
 */
export function createNativeStorageAdapter(
  key = 'theme-preference'
): ThemeStorageAdapter {
  return {
    get: async () => {
      try {
        const AsyncStorage = (
          await import('@react-native-async-storage/async-storage')
        ).default;
        const value = await AsyncStorage.getItem(key);
        if (value && VALID_PREFERENCES.includes(value as ThemePreference)) {
          return value as ThemePreference;
        }
        return null;
      } catch (_e) {
        return null;
      }
    },
    set: async (preference: ThemePreference) => {
      try {
        const AsyncStorage = (
          await import('@react-native-async-storage/async-storage')
        ).default;
        await AsyncStorage.setItem(key, preference);
      } catch (_e) {
        // Swallow storage errors
      }
    },
  };
}

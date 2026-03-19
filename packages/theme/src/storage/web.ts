import type { ThemePreference, ThemeStorageAdapter } from '../types';

const VALID_PREFERENCES: ThemePreference[] = ['light', 'dark', 'system'];

/**
 * Creates a storage adapter using localStorage (web).
 */
export function createWebStorageAdapter(
  key = 'theme-preference'
): ThemeStorageAdapter {
  return {
    get: () => {
      try {
        const value = localStorage.getItem(key);
        if (value && VALID_PREFERENCES.includes(value as ThemePreference)) {
          return Promise.resolve(value as ThemePreference);
        }
        return Promise.resolve(null);
      } catch (_e) {
        return Promise.resolve(null);
      }
    },
    set: (preference: ThemePreference) => {
      try {
        localStorage.setItem(key, preference);
      } catch (_e) {
        // localStorage may be unavailable (e.g. private browsing)
      }
      return Promise.resolve();
    },
  };
}

import type { Theme } from '../types';

/**
 * Applies the resolved theme on React Native.
 * No-op — native components read colors from ThemeProvider context.
 */
export function applyThemeEffect(_theme: Theme): void {
  // No DOM manipulation needed on native.
  // Components consume the `colors` object from useTheme().
}

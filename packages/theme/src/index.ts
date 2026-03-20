// Provider & Hook
export { ThemeProvider } from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';
export { useTheme } from './useTheme';

// Singleton
export { initTheme, _resetTheme } from './singleton';

// Storage adapters
export { createWebStorageAdapter } from './storage/web';
export { createNativeStorageAdapter } from './storage/native';

// Anti-flash script (web only)
export { THEME_ANTI_FLASH_SCRIPT } from './anti-flash-script';

// Types
export { THEME_PREFERENCES } from './types';
export type {
  Theme,
  ThemePreference,
  ThemeStorageAdapter,
  ThemeConfig,
  ThemeContextValue,
} from './types';

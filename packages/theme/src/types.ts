import type { semanticColors } from '@automatize/ui/tokens';

/** Resolved visual theme */
export type Theme = 'light' | 'dark';

/** User's preference — 'system' defers to OS setting */
export type ThemePreference = 'light' | 'dark' | 'system';

/** All available theme preferences as a runtime array */
export const THEME_PREFERENCES: ThemePreference[] = ['light', 'dark', 'system'];

/** Semantic color set (union of light and dark) */
export type SemanticColorSet =
  | (typeof semanticColors)['light']
  | (typeof semanticColors)['dark'];

/** Platform-specific persistence adapter */
export interface ThemeStorageAdapter {
  get(): Promise<ThemePreference | null>;
  set(preference: ThemePreference): Promise<void>;
}

/** Configuration passed to initTheme() */
export interface ThemeConfig {
  storageAdapter?: ThemeStorageAdapter;
  defaultPreference?: ThemePreference;
}

/** Internal state snapshot returned by the singleton */
export interface ThemeState {
  preference: ThemePreference;
  resolvedTheme: Theme;
}

/** Value provided by ThemeProvider via React context */
export interface ThemeContextValue {
  /** User's stored preference: 'light' | 'dark' | 'system' */
  preference: ThemePreference;
  /** Actual resolved theme: 'light' | 'dark' */
  resolvedTheme: Theme;
  /** Convenience boolean */
  isDark: boolean;
  /** Convenience boolean */
  isLight: boolean;
  /** Set the theme preference */
  setTheme: (pref: ThemePreference) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Active semantic color set for native consumers */
  colors: SemanticColorSet;
}

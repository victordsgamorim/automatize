import { createContext, useContext } from 'react';
import type { SettingsContextValue } from './types';

/**
 * React context for settings dialog state — populated by SettingsProvider
 * from @automatize/screens. Feature screens and layout components consume
 * this via the useSettings() hook without depending on screen internals.
 */
export const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Hook to access settings dialog state.
 * Must be used within a SettingsProvider.
 *
 * @example
 * ```tsx
 * import { useSettings } from '@automatize/core-settings';
 *
 * function MyButton() {
 *   const { openSettings } = useSettings();
 *   return <button onClick={openSettings}>Open Settings</button>;
 * }
 * ```
 */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error(
      '[core-settings] useSettings() must be used within a SettingsProvider.'
    );
  }
  return ctx;
}

/**
 * Safe variant of useSettings — returns null when outside a SettingsProvider.
 * Use when the component may render in contexts without the provider.
 */
export function useSettingsSafe(): SettingsContextValue | null {
  return useContext(SettingsContext);
}

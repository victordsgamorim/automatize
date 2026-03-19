import { useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import type { Theme } from './types';

/**
 * Listens to OS color scheme changes (React Native).
 * Returns the current system theme.
 */
export function useSystemColorScheme(): Theme {
  const [systemTheme, setSystemTheme] = useState<Theme>(
    () => (Appearance.getColorScheme() as Theme) ?? 'light'
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme((colorScheme as Theme) ?? 'light');
    });

    return () => subscription.remove();
  }, []);

  return systemTheme;
}

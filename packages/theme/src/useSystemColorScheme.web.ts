import { useState, useEffect } from 'react';
import type { Theme } from './types';

/**
 * Listens to OS color scheme changes (web).
 * Returns the current system theme.
 */
export function useSystemColorScheme(): Theme {
  const [systemTheme, setSystemTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch (_e) {
      return 'light';
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return systemTheme;
}

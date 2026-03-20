import { useState, useEffect } from 'react';
import type { Theme } from './types';

/**
 * Reads the OS color scheme from the anti-flash script's class on <html>.
 * Falls back to matchMedia if the class isn't present.
 * This avoids hydration mismatch by reading a value that is consistent
 * between server ('light' default) and client first render.
 */
function readSystemTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch (_e) {
    return 'light';
  }
}

/**
 * Listens to OS color scheme changes (web).
 * Returns the current system theme.
 *
 * Always initialises with 'light' to match the server render.
 * The real system preference is picked up in a useEffect after hydration,
 * which avoids a hydration mismatch.
 */
export function useSystemColorScheme(): Theme {
  // Always start with 'light' so server and client first-render match.
  const [systemTheme, setSystemTheme] = useState<Theme>('light');

  useEffect(() => {
    // After hydration, read the actual system preference.
    setSystemTheme(readSystemTheme());

    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return systemTheme;
}

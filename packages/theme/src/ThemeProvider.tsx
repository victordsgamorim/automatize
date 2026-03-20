import React, { createContext, useState, useEffect, useCallback } from 'react';
import { semanticColors } from '@automatize/ui/tokens';

import type { Theme, ThemePreference, ThemeContextValue } from './types';
import { getThemeAsync, getStorageAdapter, resolveTheme } from './singleton';
import { useSystemColorScheme } from './useSystemColorScheme.web';
import { applyThemeEffect } from './effects/web';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemTheme = useSystemColorScheme();

  // Always initialise with deterministic defaults so server and client produce
  // the same first render (no hydration mismatch).  The real stored preference
  // is picked up in the useEffect below, after hydration.
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<Theme>('light');

  // After hydration, read the real preference from the singleton / storage.
  useEffect(() => {
    let cancelled = false;

    getThemeAsync()
      .then((state) => {
        if (!cancelled) {
          setPreference(state.preference);
          setResolvedTheme(state.resolvedTheme);
        }
      })
      .catch((_err) => {
        if (!cancelled) {
          setPreference('system');
          setResolvedTheme(systemTheme);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Re-resolve when system theme changes and preference is 'system'
  useEffect(() => {
    if (preference === 'system') {
      setResolvedTheme(systemTheme);
    }
  }, [systemTheme, preference]);

  // Apply platform effect whenever resolved theme changes
  useEffect(() => {
    applyThemeEffect(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (pref: ThemePreference) => {
      setPreference(pref);
      const resolved = resolveTheme(pref, systemTheme);
      setResolvedTheme(resolved);

      // Persist asynchronously
      const adapter = getStorageAdapter();
      if (adapter) {
        adapter.set(pref).catch((_e) => {
          // Swallow persistence errors
        });
      }
    },
    [systemTheme]
  );

  const toggleTheme = useCallback(() => {
    const next: ThemePreference = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  const colors =
    resolvedTheme === 'dark' ? semanticColors.dark : semanticColors.light;

  const value: ThemeContextValue = {
    preference,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    setTheme,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { semanticColors } from '@automatize/ui/tokens';

import type { Theme, ThemePreference, ThemeContextValue } from './types';
import {
  getThemeSync,
  getThemeAsync,
  getStorageAdapter,
  resolveTheme,
} from './singleton';
import { useSystemColorScheme } from './useSystemColorScheme.web';
import { applyThemeEffect } from './effects/web';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemTheme = useSystemColorScheme();

  // Seed state synchronously from singleton if ready, default to 'system'/'light'
  // so server and client both render children on first pass (no hydration mismatch).
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const sync = getThemeSync();
    return sync?.preference ?? 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<Theme>(() => {
    const sync = getThemeSync();
    return sync?.resolvedTheme ?? 'light';
  });

  // Async fallback — hydrate from storage if singleton wasn't ready on mount
  const [hydrated, setHydrated] = useState(() => getThemeSync() !== null);

  useEffect(() => {
    if (hydrated) return;

    let cancelled = false;

    getThemeAsync()
      .then((state) => {
        if (!cancelled) {
          setPreference(state.preference);
          setResolvedTheme(state.resolvedTheme);
          setHydrated(true);
        }
      })
      .catch((_err) => {
        if (!cancelled) {
          setPreference('system');
          setResolvedTheme(systemTheme);
          setHydrated(true);
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

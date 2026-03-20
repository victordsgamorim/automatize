import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../src/ThemeProvider';
import { useTheme } from '../src/useTheme';
import { initTheme, _resetTheme } from '../src/singleton';

describe('useTheme', () => {
  beforeEach(() => {
    _resetTheme();
  });

  it('throws when used outside ThemeProvider', () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('[theme] useTheme() must be used within <ThemeProvider>.');
  });

  it('returns correct context value inside ThemeProvider', async () => {
    initTheme({ defaultPreference: 'light' });

    // Wait for singleton to resolve
    const { getThemeAsync } = await import('../src/singleton');
    await getThemeAsync();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    // ThemeProvider starts with deterministic defaults ('system'/'light')
    // to avoid SSR hydration mismatch, then hydrates from storage in useEffect.
    await waitFor(() => {
      expect(result.current.preference).toBe('light');
    });

    expect(result.current.resolvedTheme).toBe('light');
    expect(result.current.isDark).toBe(false);
    expect(result.current.isLight).toBe(true);
    expect(result.current.colors).toBeDefined();
    expect(result.current.colors.background.primary).toBe('#FAFAFA');
    expect(typeof result.current.setTheme).toBe('function');
    expect(typeof result.current.toggleTheme).toBe('function');
  });
});

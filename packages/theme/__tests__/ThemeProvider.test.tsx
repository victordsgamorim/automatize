import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { ThemeProvider } from '../src/ThemeProvider';
import { useTheme } from '../src/useTheme';
import { initTheme, _resetTheme } from '../src/singleton';
import type { ThemeStorageAdapter } from '../src/types';

function TestConsumer() {
  const { preference, resolvedTheme, isDark, isLight, colors } = useTheme();
  return (
    <div>
      <span data-testid="preference">{preference}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <span data-testid="isDark">{String(isDark)}</span>
      <span data-testid="isLight">{String(isLight)}</span>
      <span data-testid="bg">{colors.background.primary}</span>
    </div>
  );
}

function ToggleConsumer() {
  const { resolvedTheme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button data-testid="toggle" onClick={toggleTheme}>
        Toggle
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Dark
      </button>
      <button data-testid="set-system" onClick={() => setTheme('system')}>
        System
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    _resetTheme();
    document.documentElement.classList.remove('dark');
  });

  it('renders children with correct initial theme (light)', async () => {
    initTheme({ defaultPreference: 'light' });

    await act(async () => {
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId('preference').textContent).toBe('light');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
    expect(screen.getByTestId('isLight').textContent).toBe('true');
    expect(screen.getByTestId('isDark').textContent).toBe('false');
  });

  it('renders with dark theme when preference is dark', async () => {
    const adapter: ThemeStorageAdapter = {
      get: vi.fn().mockResolvedValue('dark'),
      set: vi.fn().mockResolvedValue(undefined),
    };
    initTheme({ storageAdapter: adapter });

    await act(async () => {
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId('resolved').textContent).toBe('dark');
    expect(screen.getByTestId('isDark').textContent).toBe('true');
  });

  it('provides correct semantic colors for resolved theme', async () => {
    initTheme({ defaultPreference: 'light' });

    await act(async () => {
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );
    });

    // light background.primary from semanticColors
    expect(screen.getByTestId('bg').textContent).toBe('#FAFAFA');
  });

  it('toggleTheme switches between light and dark', async () => {
    initTheme({ defaultPreference: 'light' });

    await act(async () => {
      render(
        <ThemeProvider>
          <ToggleConsumer />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId('resolved').textContent).toBe('light');

    await act(async () => {
      screen.getByTestId('toggle').click();
    });

    expect(screen.getByTestId('resolved').textContent).toBe('dark');

    await act(async () => {
      screen.getByTestId('toggle').click();
    });

    expect(screen.getByTestId('resolved').textContent).toBe('light');
  });

  it('setTheme persists preference to storage adapter', async () => {
    const adapter: ThemeStorageAdapter = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    };
    initTheme({ storageAdapter: adapter, defaultPreference: 'light' });

    await act(async () => {
      render(
        <ThemeProvider>
          <ToggleConsumer />
        </ThemeProvider>
      );
    });

    await act(async () => {
      screen.getByTestId('set-dark').click();
    });

    expect(adapter.set).toHaveBeenCalledWith('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  it('applies dark class to document.documentElement when dark', async () => {
    initTheme({ defaultPreference: 'dark' });

    await act(async () => {
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class when switching to light', async () => {
    initTheme({ defaultPreference: 'dark' });

    await act(async () => {
      render(
        <ThemeProvider>
          <ToggleConsumer />
        </ThemeProvider>
      );
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await act(async () => {
      screen.getByTestId('toggle').click();
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

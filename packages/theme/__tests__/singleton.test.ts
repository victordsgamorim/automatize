import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initTheme,
  getThemeSync,
  getThemeAsync,
  _resetTheme,
  getSystemTheme,
  resolveTheme,
} from '../src/singleton';
import type { ThemeStorageAdapter } from '../src/types';

describe('singleton', () => {
  beforeEach(() => {
    _resetTheme();
  });

  describe('getSystemTheme', () => {
    it('returns "light" when matchMedia is not available', () => {
      const original = window.matchMedia;
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        writable: true,
      });
      expect(getSystemTheme()).toBe('light');
      Object.defineProperty(window, 'matchMedia', {
        value: original,
        writable: true,
      });
    });

    it('returns "dark" when prefers-color-scheme is dark', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });
      expect(getSystemTheme()).toBe('dark');
    });
  });

  describe('resolveTheme', () => {
    it('returns the preference when it is not "system"', () => {
      expect(resolveTheme('light', 'dark')).toBe('light');
      expect(resolveTheme('dark', 'light')).toBe('dark');
    });

    it('returns the system theme when preference is "system"', () => {
      expect(resolveTheme('system', 'dark')).toBe('dark');
      expect(resolveTheme('system', 'light')).toBe('light');
    });
  });

  describe('initTheme', () => {
    it('getThemeSync returns null before initTheme()', () => {
      expect(getThemeSync()).toBeNull();
    });

    it('initializes with default preference "system"', async () => {
      initTheme();
      const state = await getThemeAsync();
      expect(state.preference).toBe('system');
      expect(['light', 'dark']).toContain(state.resolvedTheme);
    });

    it('is idempotent — second call is a no-op', async () => {
      const adapter: ThemeStorageAdapter = {
        get: vi.fn().mockResolvedValue('dark'),
        set: vi.fn().mockResolvedValue(undefined),
      };
      initTheme({ storageAdapter: adapter });
      initTheme({ storageAdapter: adapter }); // second call
      await getThemeAsync();
      expect(adapter.get).toHaveBeenCalledTimes(1);
    });

    it('reads stored preference from adapter', async () => {
      const adapter: ThemeStorageAdapter = {
        get: vi.fn().mockResolvedValue('dark'),
        set: vi.fn().mockResolvedValue(undefined),
      };
      initTheme({ storageAdapter: adapter });
      const state = await getThemeAsync();
      expect(state.preference).toBe('dark');
      expect(state.resolvedTheme).toBe('dark');
    });

    it('falls back to defaultPreference when adapter returns null', async () => {
      const adapter: ThemeStorageAdapter = {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined),
      };
      initTheme({ storageAdapter: adapter, defaultPreference: 'light' });
      const state = await getThemeAsync();
      expect(state.preference).toBe('light');
    });

    it('falls back gracefully when adapter throws', async () => {
      const adapter: ThemeStorageAdapter = {
        get: vi.fn().mockRejectedValue(new Error('storage error')),
        set: vi.fn().mockResolvedValue(undefined),
      };
      initTheme({ storageAdapter: adapter, defaultPreference: 'dark' });
      const state = await getThemeAsync();
      expect(state.preference).toBe('dark');
      expect(state.resolvedTheme).toBe('dark');
    });

    it('getThemeSync returns state after init resolves', async () => {
      initTheme({ defaultPreference: 'light' });
      await getThemeAsync();
      const sync = getThemeSync();
      expect(sync).not.toBeNull();
      expect((sync as NonNullable<typeof sync>).preference).toBe('light');
    });
  });

  describe('getThemeAsync', () => {
    it('throws if initTheme was never called', () => {
      expect(() => getThemeAsync()).toThrow(
        '[theme] initTheme() must be called before mounting ThemeProvider.'
      );
    });

    it('resolves immediately when state is already ready', async () => {
      initTheme();
      await getThemeAsync(); // wait for first resolve
      const state = await getThemeAsync(); // should resolve instantly
      expect(state).toBeDefined();
    });
  });

  describe('_resetTheme', () => {
    it('clears state and allows re-init', async () => {
      initTheme({ defaultPreference: 'dark' });
      await getThemeAsync();
      expect(
        (getThemeSync() as NonNullable<ReturnType<typeof getThemeSync>>)
          .preference
      ).toBe('dark');

      _resetTheme();
      expect(getThemeSync()).toBeNull();

      initTheme({ defaultPreference: 'light' });
      const state = await getThemeAsync();
      expect(state.preference).toBe('light');
    });
  });
});

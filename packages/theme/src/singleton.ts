import type { Theme, ThemePreference, ThemeConfig, ThemeState } from './types';

// Module-level singleton — lives for the entire JS runtime session.
let _config: ThemeConfig | null = null;
let _state: ThemeState | null = null;
let _ready: Promise<ThemeState> | null = null;

/**
 * Detect OS color scheme synchronously.
 * Returns 'light' when running on the server (no window).
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch (_e) {
    return 'light';
  }
}

/** Resolve a preference to an actual theme */
export function resolveTheme(
  preference: ThemePreference,
  systemTheme: Theme
): Theme {
  return preference === 'system' ? systemTheme : preference;
}

/**
 * Starts theme initialization eagerly.
 * Call this at the app entry point, before mounting the React tree.
 * Calling it more than once is safe and has no effect.
 */
export function initTheme(config?: ThemeConfig): void {
  if (_ready !== null) return; // Already started — do nothing

  _config = config ?? {};
  const adapter = _config.storageAdapter;
  const defaultPref = _config.defaultPreference ?? 'system';

  _ready = (adapter ? adapter.get() : Promise.resolve(null))
    .then((stored) => {
      const preference = stored ?? defaultPref;
      const resolvedTheme = resolveTheme(preference, getSystemTheme());
      _state = { preference, resolvedTheme };
      return _state;
    })
    .catch((_err) => {
      const preference = defaultPref;
      const resolvedTheme = resolveTheme(preference, getSystemTheme());
      _state = { preference, resolvedTheme };
      return _state;
    });
}

/**
 * Returns the theme state synchronously if already ready,
 * or null if initialization is still in progress.
 */
export function getThemeSync(): ThemeState | null {
  return _state;
}

/**
 * Returns a Promise that resolves to the theme state.
 * Throws if initTheme() was never called.
 */
export function getThemeAsync(): Promise<ThemeState> {
  if (_state !== null) return Promise.resolve(_state);
  if (_ready !== null) return _ready;
  throw new Error(
    '[theme] initTheme() must be called before mounting ThemeProvider.'
  );
}

/**
 * Returns the storage adapter (if any) passed to initTheme().
 */
export function getStorageAdapter() {
  return _config?.storageAdapter ?? null;
}

/**
 * @internal — for testing only.
 * Resets the singleton so each test gets a clean slate.
 */
export function _resetTheme(): void {
  _config = null;
  _state = null;
  _ready = null;
}

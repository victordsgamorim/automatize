import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

import type {
  TranslationLoader,
  SupportedLanguage,
  SupportedNamespace,
} from './loaders/types';

// Module-level singleton — lives for the entire JS runtime session.
// Cleared only when the app is closed/reloaded (module re-evaluated).
let _instance: i18n | null = null;
let _promise: Promise<i18n> | null = null;

/**
 * Starts i18next initialization eagerly.
 * Call this at the app entry point, before mounting the React tree.
 * Calling it more than once is safe and has no effect.
 *
 * When the loader provides pre-loaded `resources`, init is synchronous —
 * `getLocalizationInstanceSync()` returns a fully-initialised instance
 * immediately after this call.  This is critical for SSR: both server
 * and client render translated text on the first pass (no hydration mismatch).
 */
export function initLocalization(
  loader: TranslationLoader,
  defaultLanguage: SupportedLanguage = 'en'
): void {
  if (_promise !== null) return; // Already started — do nothing

  const inst = i18next.createInstance();

  const sharedOpts = {
    lng: defaultLanguage,
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  } as const;

  if (loader.resources) {
    // Synchronous path — resources are already in memory.
    // Pass them directly to init() so translations are available immediately.
    inst.use(initReactI18next).init({
      ...sharedOpts,
      resources: loader.resources,
      initImmediate: false,
    } as Parameters<typeof inst.init>[0]);

    _instance = inst;
    _promise = Promise.resolve(inst);
  } else {
    // Async path — resources loaded via backend plugin.
    _promise = inst
      .use(initReactI18next)
      .use(
        resourcesToBackend((language: string, namespace: string) =>
          loader
            .load(
              language as SupportedLanguage,
              namespace as SupportedNamespace
            )
            .catch(() => ({}) as Record<string, string>)
        )
      )
      .init(sharedOpts)
      .then(() => {
        _instance = inst;
        return inst;
      });
  }
}

/**
 * Returns the i18n instance synchronously if it is already ready,
 * or null if initialization is still in progress.
 * Use this to hydrate useState immediately without an async round-trip.
 */
export function getLocalizationInstanceSync(): i18n | null {
  return _instance;
}

/**
 * Returns a Promise that resolves to the i18n instance.
 * Throws if initLocalization() was never called.
 */
export function getLocalizationInstanceAsync(): Promise<i18n> {
  if (_instance !== null) return Promise.resolve(_instance);
  if (_promise !== null) return _promise;
  throw new Error(
    '[localization] initLocalization() must be called before mounting LocalizationProvider.'
  );
}

/**
 * @internal — for testing only.
 * Resets the singleton so each test gets a clean slate.
 */
export function _resetLocalization(): void {
  _instance = null;
  _promise = null;
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  initLocalization,
  getLocalizationInstanceSync,
  getLocalizationInstanceAsync,
  _resetLocalization,
} from '../src/singleton';
import { createLocalLoader } from '../src/loaders/LocalLoader';
import type { TranslationLoader } from '../src/loaders/types';

beforeEach(() => _resetLocalization());
afterEach(() => _resetLocalization());

describe('singleton', () => {
  describe('initial state after reset', () => {
    it('getLocalizationInstanceSync returns null before initLocalization is called', () => {
      expect(getLocalizationInstanceSync()).toBeNull();
    });

    it('getLocalizationInstanceAsync throws before initLocalization is called', () => {
      expect(() => getLocalizationInstanceAsync()).toThrow(
        '[localization] initLocalization() must be called before mounting LocalizationProvider.'
      );
    });
  });

  describe('initLocalization', () => {
    it('starts initialization and makes getLocalizationInstanceAsync resolve', async () => {
      initLocalization(createLocalLoader());
      const instance = await getLocalizationInstanceAsync();
      expect(instance).not.toBeNull();
    });

    it('resolves with an i18n instance that has a t function', async () => {
      initLocalization(createLocalLoader(), 'en');
      const instance = await getLocalizationInstanceAsync();
      expect(typeof instance.t).toBe('function');
    });

    it('defaults to "en" when no language is specified', async () => {
      initLocalization(createLocalLoader());
      const instance = await getLocalizationInstanceAsync();
      expect(instance.language).toBe('en');
    });

    it('uses the provided default language', async () => {
      initLocalization(createLocalLoader(), 'pt-BR');
      const instance = await getLocalizationInstanceAsync();
      expect(instance.language).toBe('pt-BR');
    });

    it('is idempotent — second call is a no-op', async () => {
      const loader1 = createLocalLoader();
      const loader2: TranslationLoader = {
        load: vi.fn().mockResolvedValue({}),
      };

      initLocalization(loader1, 'en');
      initLocalization(loader2, 'pt-BR'); // ignored

      const instance = await getLocalizationInstanceAsync();
      expect(instance.language).toBe('en');
      expect(loader2.load).not.toHaveBeenCalled();
    });

    it('calls the loader to fetch translations', async () => {
      const loader: TranslationLoader = {
        load: vi.fn().mockResolvedValue({ 'app.title': 'Test' }),
      };
      initLocalization(loader, 'en');
      await getLocalizationInstanceAsync();
      expect(loader.load).toHaveBeenCalledWith('en', 'common');
    });
  });

  describe('getLocalizationInstanceSync', () => {
    it('returns instance immediately after initLocalization (sync when loader has resources)', () => {
      initLocalization(createLocalLoader());
      // With pre-loaded resources, init is synchronous
      expect(getLocalizationInstanceSync()).not.toBeNull();
    });

    it('returns the instance once init has completed', async () => {
      initLocalization(createLocalLoader());
      await getLocalizationInstanceAsync(); // wait for completion
      expect(getLocalizationInstanceSync()).not.toBeNull();
    });
  });

  describe('getLocalizationInstanceAsync', () => {
    it('returns a resolved promise when instance is already ready', async () => {
      initLocalization(createLocalLoader());
      await getLocalizationInstanceAsync(); // first wait — sets _instance

      // Second call should resolve without waiting
      const instance = await getLocalizationInstanceAsync();
      expect(instance).not.toBeNull();
    });

    it('returns the same instance on repeated calls', async () => {
      initLocalization(createLocalLoader());
      const [a, b] = await Promise.all([
        getLocalizationInstanceAsync(),
        getLocalizationInstanceAsync(),
      ]);
      expect(a).toBe(b);
    });
  });

  describe('_resetLocalization', () => {
    it('resets sync instance to null', async () => {
      initLocalization(createLocalLoader());
      await getLocalizationInstanceAsync();
      _resetLocalization();
      expect(getLocalizationInstanceSync()).toBeNull();
    });

    it('resets async getter to throw state', async () => {
      initLocalization(createLocalLoader());
      await getLocalizationInstanceAsync();
      _resetLocalization();
      expect(() => getLocalizationInstanceAsync()).toThrow();
    });

    it('allows re-initialization after reset', async () => {
      initLocalization(createLocalLoader(), 'en');
      await getLocalizationInstanceAsync();

      _resetLocalization();

      initLocalization(createLocalLoader(), 'pt-BR');
      const instance = await getLocalizationInstanceAsync();
      expect(instance.language).toBe('pt-BR');
    });
  });

  describe('graceful error handling', () => {
    it('resolves even when the loader rejects', async () => {
      const failingLoader: TranslationLoader = {
        load: vi.fn().mockRejectedValue(new Error('network error')),
      };
      initLocalization(failingLoader, 'en');
      const instance = await getLocalizationInstanceAsync();
      expect(instance).not.toBeNull();
    });
  });
});

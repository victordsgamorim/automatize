import { createContext, useContext } from 'react';

/**
 * Translation function signature — mirrors react-i18next's `t` function.
 * Accepts a key and optional interpolation options, returns the translated string.
 */
export type TFunction = (
  key: string,
  options?: Record<string, unknown>
) => string;

export interface TranslationContextValue {
  /** Translation function bound to the current language */
  t: TFunction;
  /** Current language code (e.g. 'en', 'pt-BR') */
  language: string;
  /** Change the active language */
  changeLanguage: (code: string) => void;
}

/**
 * React context for translation — populated by LocalizationProvider
 * from @automatize/localization. Feature screens consume this via
 * the useTranslation() hook without depending on react-i18next.
 */
export const TranslationContext = createContext<TranslationContextValue | null>(
  null
);

/**
 * Hook to access translations in feature screens.
 * Must be used within a LocalizationProvider.
 *
 * @example
 * ```tsx
 * import { useTranslation } from '@automatize/core-localization';
 *
 * function MyScreen() {
 *   const { t } = useTranslation();
 *   return <Text>{t('sign-in.welcome')}</Text>;
 * }
 * ```
 */
export function useTranslation(): TranslationContextValue {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[core-localization] useTranslation() called outside of LocalizationProvider.'
      );
    }
    // Fallback: return key as-is so the app doesn't crash
    return {
      t: (key: string) => key,
      language: 'en',
      changeLanguage: () => {},
    };
  }
  return ctx;
}

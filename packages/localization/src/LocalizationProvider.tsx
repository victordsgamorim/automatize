import React, { useMemo } from 'react';
import {
  I18nextProvider,
  useTranslation as useI18nextTranslation,
} from 'react-i18next';
import { TranslationContext } from '@automatize/core-localization';
import type { TranslationContextValue } from '@automatize/core-localization';

import { getLocalizationInstanceSync } from './singleton';

export interface LocalizationProviderProps {
  children: React.ReactNode;
}

/**
 * Internal bridge component that reads the i18next state via react-i18next
 * and provides it through core's TranslationContext so feature screens
 * can use useTranslation() from @automatize/core-localization without
 * depending on react-i18next directly.
 */
function TranslationBridge({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useI18nextTranslation();

  const value = useMemo<TranslationContextValue>(
    () => ({
      t: (key: string, options?: Record<string, unknown>) =>
        String(t(key, options as never)),
      language: i18n.language,
      changeLanguage: (code: string) => {
        i18n.changeLanguage(code);
      },
    }),
    [t, i18n]
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  // After initLocalization() is called (at module level in the app entry),
  // the instance is available synchronously — even before async init resolves.
  // This guarantees children are always rendered, avoiding SSR hydration mismatch.
  const instance = getLocalizationInstanceSync();

  if (!instance) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[localization] initLocalization() must be called before mounting LocalizationProvider.'
      );
    }
    return <>{children}</>;
  }

  return (
    <I18nextProvider i18n={instance}>
      <TranslationBridge>{children}</TranslationBridge>
    </I18nextProvider>
  );
}

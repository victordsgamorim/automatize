import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { getLocalizationInstanceSync } from './singleton';

export interface LocalizationProviderProps {
  children: React.ReactNode;
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

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}

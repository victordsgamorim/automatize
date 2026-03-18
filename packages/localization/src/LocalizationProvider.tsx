import React, { useState, useEffect } from 'react';
import { type i18n } from 'i18next';
import { I18nextProvider } from 'react-i18next';

import {
  getLocalizationInstanceSync,
  getLocalizationInstanceAsync,
} from './singleton';

export interface LocalizationProviderProps {
  children: React.ReactNode;
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  // Seed state synchronously — if initLocalization() already completed before
  // this component mounts, there is no null render at all.
  const [instance, setInstance] = useState<i18n | null>(
    getLocalizationInstanceSync
  );

  useEffect(() => {
    // Instance was already ready on mount — nothing to do.
    if (instance !== null) return;

    let cancelled = false;

    getLocalizationInstanceAsync()
      .then((inst) => {
        if (!cancelled) setInstance(inst);
      })
      .catch((_err) => {
        console.warn(
          '[localization] initLocalization() was not called before mounting LocalizationProvider.'
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!instance) return null;

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}

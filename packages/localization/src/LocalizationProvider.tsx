import React, { useState, useEffect } from 'react';
import i18next, { type i18n } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

import type {
  TranslationLoader,
  SupportedLanguage,
  SupportedNamespace,
} from './loaders/types';

export interface LocalizationProviderProps {
  loader: TranslationLoader;
  defaultLanguage?: SupportedLanguage;
  children: React.ReactNode;
}

export function LocalizationProvider({
  loader,
  defaultLanguage = 'en',
  children,
}: LocalizationProviderProps) {
  const [instance, setInstance] = useState<i18n | null>(null);

  useEffect(() => {
    const i18nInstance = i18next.createInstance();

    i18nInstance
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
      .init({
        lng: defaultLanguage,
        fallbackLng: 'en',
        ns: ['common'],
        defaultNS: 'common',
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
      })
      .then(() => {
        setInstance(i18nInstance);
      })
      .catch((_err) => {
        setInstance(i18nInstance);
      });
  }, [loader, defaultLanguage]);

  if (!instance) return null;

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}

'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useNavigation } from '@automatize/navigation';
import { useTranslation, SUPPORTED_LANGUAGES } from '@automatize/localization';
import { useTheme, THEME_PREFERENCES } from '@automatize/theme';
import { ClientFormScreen } from '@automatize/screens/client-form/web';
import type { ClientFormData } from '@automatize/screens/client-form/web';
import type { ClientRow } from '@automatize/screens/client/web';
import { generateId } from '@automatize/utils';
import { addSavedClient } from '../clientStore';

/**
 * Module-level draft store. Survives client-side (SPA) navigations
 * but is naturally cleared on page refresh or new browser session
 * since the JS runtime restarts.
 */
let formDraft: ClientFormData | undefined;

function toClientRow(data: ClientFormData): ClientRow {
  return {
    id: generateId(),
    name: data.name,
    addresses: data.addresses.map((a) => ({
      id: a.id,
      street: a.street,
      number: a.number,
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
    })),
    phones: data.phones.map((p) => ({
      id: p.id,
      number: p.number,
    })),
  };
}

export default function NewClientPage(): React.JSX.Element {
  const { navigate } = useNavigation();
  const { i18n, t } = useTranslation();
  const { preference, isDark, setTheme } = useTheme();

  const [initialData] = useState(() => formDraft);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  useEffect(() => {
    if (!initialData && !formDraft) return;

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setShowDiscardDialog(true);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDataChange = useCallback((data: ClientFormData) => {
    formDraft = data;
  }, []);

  const handleSubmit = (data: ClientFormData) => {
    addSavedClient(toClientRow(data));
    formDraft = undefined;
    navigate('/clients');
  };

  const handleBack = () => {
    formDraft = undefined;
    navigate('/clients');
  };

  const handleDiscardCancel = () => {
    setShowDiscardDialog(false);
    window.history.pushState(null, '', window.location.href);
  };

  return (
    <ClientFormScreen
      onSubmit={handleSubmit}
      initialData={initialData}
      onDataChange={handleDataChange}
      onBack={handleBack}
      showDiscardDialog={showDiscardDialog}
      onDiscardCancel={handleDiscardCancel}
      locale={{
        languages: SUPPORTED_LANGUAGES.map((lang) => ({
          code: lang,
          label: t(`app.language.${lang}`),
          ext: t(`app.language.${lang}.ext`),
        })),
        currentLanguage: i18n.language,
        onLanguageChange: (code) => void i18n.changeLanguage(code),
      }}
      theme={{
        currentTheme: preference,
        isDarkTheme: isDark,
        themeOptions: THEME_PREFERENCES.map((pref) => ({
          value: pref,
          label: t(`theme.${pref}`),
        })),
        onThemeChange: setTheme,
      }}
    />
  );
}

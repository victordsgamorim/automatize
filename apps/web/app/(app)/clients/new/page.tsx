'use client';

import { useCallback, useState } from 'react';
import { useNavigation } from '@automatize/navigation';
import { useTranslation, SUPPORTED_LANGUAGES } from '@automatize/localization';
import { useTheme, THEME_PREFERENCES } from '@automatize/theme';
import { ClientFormScreen } from '@automatize/screens/client-form/web';
import type { ClientFormData } from '@automatize/screens/client-form/web';

const STORAGE_KEY = 'automatize:client-form-draft';

function loadDraft(): ClientFormData | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ClientFormData;
  } catch {
    /* corrupted data — ignore */
  }
  return undefined;
}

function clearDraft() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export default function NewClientPage() {
  const { navigate } = useNavigation();
  const { i18n, t } = useTranslation();
  const { preference, isDark, setTheme } = useTheme();

  // Load draft once on mount
  const [initialData] = useState(loadDraft);

  const handleDataChange = useCallback((data: ClientFormData) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const handleSubmit = (data: ClientFormData) => {
    // eslint-disable-next-line no-console
    console.warn('New client data:', data);
    clearDraft();
    navigate('/clients');
  };

  return (
    <ClientFormScreen
      onSubmit={handleSubmit}
      initialData={initialData}
      onDataChange={handleDataChange}
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

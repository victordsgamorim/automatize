'use client';

import React from 'react';
import { useNavigation } from '@automatize/navigation';
import { useTranslation, SUPPORTED_LANGUAGES } from '@automatize/localization';
import { useTheme, THEME_PREFERENCES } from '@automatize/theme';
import { ClientScreen, useClientContext } from '@automatize/screens/client/web';
import type { ClientRow } from '@automatize/screens/client/web';

export default function ClientsPage(): React.JSX.Element {
  const { navigate } = useNavigation();
  const { i18n, t } = useTranslation();
  const { preference, isDark, setTheme } = useTheme();

  const { clients, setClientToEdit } = useClientContext();

  const handleEditClient = (client: ClientRow) => {
    setClientToEdit(client.id);
    navigate('/clients/edit');
  };

  return (
    <ClientScreen
      clients={clients}
      onAddClient={() => navigate('/clients/new')}
      onEditClient={handleEditClient}
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

'use client';

import { useTranslation, SUPPORTED_LANGUAGES } from '@automatize/localization';
import { useTheme, THEME_PREFERENCES } from '@automatize/theme';
import { ClientScreen } from '@automatize/screens/client/web';
import type { ClientFormData } from '@automatize/screens/client/web';

export default function ClientsPage() {
  const { i18n, t } = useTranslation();
  const { preference, isDark, setTheme } = useTheme();

  const handleSubmit = (data: ClientFormData) => {
    // eslint-disable-next-line no-console
    console.warn('New client data:', data);
  };

  return (
    <ClientScreen
      onSubmit={handleSubmit}
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

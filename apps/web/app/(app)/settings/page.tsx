'use client';

import { useTranslation, SUPPORTED_LANGUAGES } from '@automatize/localization';
import { useTheme, THEME_PREFERENCES } from '@automatize/theme';
import { SettingsScreen } from '@automatize/settings/web';

export default function SettingsPage() {
  const { i18n, t } = useTranslation();
  const { preference, isDark, setTheme } = useTheme();

  return (
    <SettingsScreen
      labels={{
        title: t('settings.title'),
        subtitle: t('settings.subtitle'),
        appearanceTitle: t('settings.appearance.title'),
        appearanceDescription: t('settings.appearance.description'),
        themeLabel: t('settings.appearance.theme-label'),
        languageTitle: t('settings.language.title'),
        languageDescription: t('settings.language.description'),
        languageLabel: t('settings.language.language-label'),
        aboutTitle: t('settings.about.title'),
        versionLabel: t('settings.about.version'),
      }}
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
      appVersion="0.1.0"
    />
  );
}

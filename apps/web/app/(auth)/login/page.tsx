'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation, SUPPORTED_LANGUAGES } from '@automatize/localization';
import { useTheme, THEME_PREFERENCES } from '@automatize/theme';
import { SignInScreen } from '@automatize/screens/sign-in/web';

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const { preference, isDark, setTheme } = useTheme();

  return (
    <SignInScreen
      onSuccess={() => router.push('/')}
      onResetPassword={() => router.push('/forgot-password')}
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

'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@automatize/localization';
import { useTheme } from '@automatize/theme';
import { SignInScreen } from '@automatize/sign-in/web';

export default function LoginPage() {
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const { preference, isDark, setTheme } = useTheme();

  return (
    <SignInScreen
      onSuccess={() => router.push('/')}
      onResetPassword={() => router.push('/forgot-password')}
      locale={{
        languages: (['en', 'pt-BR'] as const).map((lang) => ({
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
        themeOptions: [
          { value: 'light', label: t('theme.light') },
          { value: 'dark', label: t('theme.dark') },
          { value: 'system', label: t('theme.system') },
        ],
        onThemeChange: setTheme,
      }}
    />
  );
}

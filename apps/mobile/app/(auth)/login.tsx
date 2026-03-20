/**
 * Login Screen
 * Email and password authentication using cross-platform SignInScreen
 */

import { router } from 'expo-router';
import { useTranslation } from '@automatize/localization';
import { SignInScreen } from '@automatize/sign-in';

export default function LoginScreen() {
  const { i18n, t } = useTranslation();

  return (
    <SignInScreen
      onSuccess={() => {
        // Navigation handled by AuthProvider state change
      }}
      onResetPassword={() => router.push('/(auth)/forgot-password')}
      locale={{
        languages: (['en', 'pt-BR'] as const).map((lang) => ({
          code: lang,
          label: t(`app.language.${lang}`),
          ext: t(`app.language.${lang}.ext`),
        })),
        currentLanguage: i18n.language,
        onLanguageChange: (code) => void i18n.changeLanguage(code),
      }}
    />
  );
}

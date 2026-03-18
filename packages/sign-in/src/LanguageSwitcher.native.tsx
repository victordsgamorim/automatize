import React from 'react';
import { Button } from '@automatize/ui';
import { useTranslation } from '@automatize/localization';
import type { SupportedLanguage } from '@automatize/localization';

const LANGUAGES: SupportedLanguage[] = ['en', 'pt-BR'];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const currentLang = i18n.language as SupportedLanguage;

  function handleSwitch() {
    const currentIndex = LANGUAGES.indexOf(currentLang);
    const nextLang = LANGUAGES[(currentIndex + 1) % LANGUAGES.length];
    void i18n.changeLanguage(nextLang);
  }

  return (
    <Button
      variant="ghost"
      onPress={handleSwitch}
      testID="language-switcher"
      accessibilityLabel={t('language.switch-label')}
    >
      {t(`language.${currentLang}` as const)}
    </Button>
  );
}

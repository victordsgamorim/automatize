import React from 'react';
import { LanguageSwitcher as UiLanguageSwitcher } from '@automatize/ui/web';
import { useTranslation } from '@automatize/localization';
import type { SupportedLanguage } from '@automatize/localization';

const LANGUAGES: SupportedLanguage[] = ['en', 'pt-BR'];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const currentLang = i18n.language as SupportedLanguage;

  const languages = LANGUAGES.map((lang) => ({
    code: lang,
    label: t(`app.language.${lang}` as const),
    ext: t(`app.language.${lang}.ext` as const),
  }));

  return (
    <UiLanguageSwitcher
      languages={languages}
      currentLanguage={currentLang}
      onLanguageChange={(code) => void i18n.changeLanguage(code)}
      triggerAriaLabel={t('language.switch-label')}
    />
  );
}

import React from 'react';
import { ThemeSwitcher as UiThemeSwitcher } from '@automatize/ui/web';
import type { ThemePreferenceOption } from '@automatize/ui/web';
import { useTheme } from '@automatize/theme';
import { useTranslation } from '@automatize/localization';

export function ThemeSwitcher() {
  const { preference, isDark, setTheme } = useTheme();
  const { t } = useTranslation();

  const options = [
    { value: 'light' as ThemePreferenceOption, label: t('theme.light') },
    { value: 'dark' as ThemePreferenceOption, label: t('theme.dark') },
    { value: 'system' as ThemePreferenceOption, label: t('theme.system') },
  ];

  return (
    <UiThemeSwitcher
      currentPreference={preference}
      isDark={isDark}
      options={options}
      onPreferenceChange={setTheme}
      triggerAriaLabel={t('theme.switch-label')}
    />
  );
}

import React from 'react';
import { ThemeSwitcher } from '../components/ThemeSwitcher/ThemeSwitcher.web';
import { LanguageSwitcher } from '../components/LanguageSwitcher/LanguageSwitcher.web';
import type { SettingsScreenProps } from './SettingsScreen.types';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  labels,
  locale,
  theme,
  appVersion,
}) => {
  return (
    <div className="space-y-4 font-geist">
      {/* Appearance */}
      {theme && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {labels.appearanceTitle}
          </span>
          <ThemeSwitcher
            currentPreference={theme.currentTheme}
            isDark={theme.isDarkTheme}
            options={theme.themeOptions}
            onPreferenceChange={theme.onThemeChange}
            triggerAriaLabel={labels.themeLabel}
          />
        </div>
      )}

      {/* Language */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {labels.languageTitle}
        </span>
        <LanguageSwitcher
          languages={locale.languages}
          currentLanguage={locale.currentLanguage}
          onLanguageChange={locale.onLanguageChange}
          triggerAriaLabel={labels.languageLabel}
        />
      </div>

      {/* About */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {labels.aboutTitle}
        </span>
        <span className="text-sm text-muted-foreground">
          {labels.versionLabel}: {appVersion}
        </span>
      </div>
    </div>
  );
};

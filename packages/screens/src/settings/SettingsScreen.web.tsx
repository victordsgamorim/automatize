import React from 'react';
import { ThemeSwitcher, LanguageSwitcher } from '@automatize/ui/web';
import type { SettingsScreenProps } from './SettingsScreen.types';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  labels,
  locale,
  theme,
  appVersion,
}) => {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 font-geist">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {labels.title}
        </h1>
        <p className="text-muted-foreground">{labels.subtitle}</p>
      </div>

      <div className="space-y-4">
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
    </div>
  );
};

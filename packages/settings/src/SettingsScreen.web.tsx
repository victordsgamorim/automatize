import React from 'react';
import { LogOut } from 'lucide-react';
import {
  Button,
  Label,
  Card,
  Separator,
  ThemeSwitcher,
  LanguageSwitcher,
} from '@automatize/ui/web';
import type { SettingsScreenProps } from './SettingsScreen.types';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  labels,
  locale,
  theme,
  appVersion,
  onSignOut,
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

      {/* Appearance Section */}
      {theme && (
        <Card padding="lg">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-foreground">
                {labels.appearanceTitle}
              </h2>
              <p className="text-sm text-muted-foreground">
                {labels.appearanceDescription}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label>{labels.themeLabel}</Label>
              <ThemeSwitcher
                currentPreference={theme.currentTheme}
                isDark={theme.isDarkTheme}
                options={theme.themeOptions}
                onPreferenceChange={theme.onThemeChange}
                triggerAriaLabel={labels.themeLabel}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Language Section */}
      <Card padding="lg">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              {labels.languageTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {labels.languageDescription}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Label>{labels.languageLabel}</Label>
            <LanguageSwitcher
              languages={locale.languages}
              currentLanguage={locale.currentLanguage}
              onLanguageChange={locale.onLanguageChange}
              triggerAriaLabel={labels.languageLabel}
            />
          </div>
        </div>
      </Card>

      <Separator />

      {/* About Section */}
      <Card padding="lg">
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">
            {labels.aboutTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
            {labels.versionLabel}: {appVersion}
          </p>
        </div>
      </Card>

      {/* Account Section */}
      <Card padding="lg">
        <Button variant="destructive" onClick={onSignOut} className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          {labels.signOut}
        </Button>
      </Card>
    </div>
  );
};

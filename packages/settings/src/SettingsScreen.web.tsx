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
import { useTranslation } from '@automatize/core-localization';
import type { SettingsScreenProps } from './SettingsScreen.types';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  locale,
  theme,
  appVersion,
  onSignOut,
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 font-geist">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      {/* Appearance Section */}
      {theme && (
        <Card padding="lg">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-foreground">
                {t('settings.appearance.title')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('settings.appearance.description')}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('settings.appearance.theme-label')}</Label>
              <ThemeSwitcher
                currentPreference={theme.currentTheme}
                isDark={theme.isDarkTheme}
                options={theme.themeOptions}
                onPreferenceChange={theme.onThemeChange}
                triggerAriaLabel={t('settings.appearance.theme-label')}
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
              {t('settings.language.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('settings.language.description')}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Label>{t('settings.language.language-label')}</Label>
            <LanguageSwitcher
              languages={locale.languages}
              currentLanguage={locale.currentLanguage}
              onLanguageChange={locale.onLanguageChange}
              triggerAriaLabel={t('settings.language.language-label')}
            />
          </div>
        </div>
      </Card>

      <Separator />

      {/* About Section */}
      <Card padding="lg">
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-foreground">
            {t('settings.about.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('settings.about.version')}: {appVersion}
          </p>
        </div>
      </Card>

      {/* Account Section */}
      <Card padding="lg">
        <Button variant="destructive" onClick={onSignOut} className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          {t('settings.account.sign-out')}
        </Button>
      </Card>
    </div>
  );
};

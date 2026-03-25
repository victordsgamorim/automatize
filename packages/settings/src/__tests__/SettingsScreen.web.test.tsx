import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { SettingsScreen } from '../SettingsScreen.web';
import type { SettingsScreenProps } from '../SettingsScreen.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'settings.title': 'Settings',
        'settings.subtitle': 'Manage your preferences',
        'settings.appearance.title': 'Appearance',
        'settings.appearance.description': 'Customize how the app looks',
        'settings.appearance.theme-label': 'Theme',
        'settings.language.title': 'Language',
        'settings.language.description': 'Choose your preferred language',
        'settings.language.language-label': 'Language',
        'settings.about.title': 'About',
        'settings.about.version': 'Version',
        'settings.account.sign-out': 'Sign out',
      })[key] ?? key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'settings.title': 'Settings',
        'settings.subtitle': 'Manage your preferences',
        'settings.appearance.title': 'Appearance',
        'settings.appearance.description': 'Customize how the app looks',
        'settings.appearance.theme-label': 'Theme',
        'settings.language.title': 'Language',
        'settings.language.description': 'Choose your preferred language',
        'settings.language.language-label': 'Language',
        'settings.about.title': 'About',
        'settings.about.version': 'Version',
        'settings.account.sign-out': 'Sign out',
      })[key] ?? key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

const defaultProps: SettingsScreenProps = {
  locale: {
    languages: [
      { code: 'en', label: 'English', ext: 'US' },
      { code: 'pt-BR', label: 'Português', ext: 'BR' },
    ],
    currentLanguage: 'en',
    onLanguageChange: vi.fn(),
  },
  theme: {
    currentTheme: 'system',
    isDarkTheme: false,
    themeOptions: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'System' },
    ],
    onThemeChange: vi.fn(),
  },
  appVersion: '1.0.0',
  onSignOut: vi.fn(),
};

async function renderScreen(props: Partial<SettingsScreenProps> = {}) {
  render(<SettingsScreen {...defaultProps} {...props} />);
  await waitFor(() => screen.getByText('Settings'));
}

describe('SettingsScreen (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the settings title', async () => {
      await renderScreen();
      expect(screen.getByText('Settings')).toBeDefined();
    });

    it('renders the subtitle', async () => {
      await renderScreen();
      expect(screen.getByText('Manage your preferences')).toBeDefined();
    });

    it('renders the Appearance section heading', async () => {
      await renderScreen();
      expect(screen.getByText('Appearance')).toBeDefined();
    });

    it('renders the Language section heading', async () => {
      await renderScreen();
      expect(screen.getByText('Choose your preferred language')).toBeDefined();
    });

    it('renders the About section with version', async () => {
      await renderScreen();
      expect(screen.getByText('About')).toBeDefined();
      expect(screen.getByText('Version: 1.0.0')).toBeDefined();
    });

    it('renders the Sign out button', async () => {
      await renderScreen();
      expect(screen.getByRole('button', { name: /Sign out/i })).toBeDefined();
    });

    it('renders ThemeSwitcher when theme prop is provided', async () => {
      await renderScreen();
      expect(screen.getByLabelText('Theme')).toBeDefined();
    });

    it('does not render Appearance section when theme is undefined', async () => {
      await renderScreen({ theme: undefined });
      expect(screen.queryByText('Appearance')).toBeNull();
    });

    it('renders the LanguageSwitcher trigger', async () => {
      await renderScreen();
      expect(screen.getByLabelText('Language')).toBeDefined();
    });
  });

  describe('interactions', () => {
    it('calls onSignOut when Sign out button is clicked', async () => {
      const onSignOut = vi.fn();
      await renderScreen({ onSignOut });
      fireEvent.click(screen.getByRole('button', { name: /Sign out/i }));
      expect(onSignOut).toHaveBeenCalledOnce();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { SettingsScreen } from '../SettingsScreen.web';
import type { SettingsScreenProps } from '../SettingsScreen.types';

const defaultProps: SettingsScreenProps = {
  labels: {
    title: 'Settings',
    subtitle: 'Manage your preferences',
    appearanceTitle: 'Appearance',
    appearanceDescription: 'Customize how the app looks',
    themeLabel: 'Theme',
    languageTitle: 'Language',
    languageDescription: 'Choose your preferred language',
    languageLabel: 'Language',
    aboutTitle: 'About',
    versionLabel: 'Version',
    signOut: 'Sign out',
  },
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

function renderScreen(props: Partial<SettingsScreenProps> = {}) {
  render(<SettingsScreen {...defaultProps} {...props} />);
}

describe('SettingsScreen (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the settings title', () => {
      renderScreen();
      expect(screen.getByText('Settings')).toBeDefined();
    });

    it('renders the subtitle', () => {
      renderScreen();
      expect(screen.getByText('Manage your preferences')).toBeDefined();
    });

    it('renders the Appearance section heading', () => {
      renderScreen();
      expect(screen.getByText('Appearance')).toBeDefined();
    });

    it('renders the Language section heading', () => {
      renderScreen();
      expect(screen.getByText('Choose your preferred language')).toBeDefined();
    });

    it('renders the About section with version', () => {
      renderScreen();
      expect(screen.getByText('About')).toBeDefined();
      expect(screen.getByText('Version: 1.0.0')).toBeDefined();
    });

    it('renders the Sign out button', () => {
      renderScreen();
      expect(screen.getByRole('button', { name: /Sign out/i })).toBeDefined();
    });

    it('renders ThemeSwitcher when theme prop is provided', () => {
      renderScreen();
      expect(screen.getByLabelText('Theme')).toBeDefined();
    });

    it('does not render Appearance section when theme is undefined', () => {
      renderScreen({ theme: undefined });
      expect(screen.queryByText('Appearance')).toBeNull();
    });

    it('renders the LanguageSwitcher trigger', () => {
      renderScreen();
      expect(screen.getByLabelText('Language')).toBeDefined();
    });
  });

  describe('interactions', () => {
    it('calls onSignOut when Sign out button is clicked', () => {
      const onSignOut = vi.fn();
      renderScreen({ onSignOut });
      fireEvent.click(screen.getByRole('button', { name: /Sign out/i }));
      expect(onSignOut).toHaveBeenCalledOnce();
    });
  });
});

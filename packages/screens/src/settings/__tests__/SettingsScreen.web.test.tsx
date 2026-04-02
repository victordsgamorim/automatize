import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
};

function renderScreen(props: Partial<SettingsScreenProps> = {}) {
  render(<SettingsScreen {...defaultProps} {...props} />);
}

describe('SettingsScreen (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('does not render an h1 heading (title comes from page header)', () => {
      renderScreen();
      const headings = document.querySelectorAll('h1');
      expect(headings.length).toBe(0);
    });

    it('renders the subtitle as a paragraph', () => {
      renderScreen();
      const subtitle = screen.getByText('Manage your preferences');
      expect(subtitle).toBeDefined();
      expect(subtitle.tagName).toBe('P');
    });

    it('renders the Appearance row', () => {
      renderScreen();
      expect(screen.getByText('Appearance')).toBeDefined();
    });

    it('renders the Language row', () => {
      renderScreen();
      expect(screen.getByText('Language')).toBeDefined();
    });

    it('renders the About row with version', () => {
      renderScreen();
      expect(screen.getByText('About')).toBeDefined();
      expect(screen.getByText('Version: 1.0.0')).toBeDefined();
    });

    it('renders ThemeSwitcher when theme prop is provided', () => {
      renderScreen();
      expect(screen.getByLabelText('Theme')).toBeDefined();
    });

    it('does not render Appearance row when theme is undefined', () => {
      renderScreen({ theme: undefined });
      expect(screen.queryByText('Appearance')).toBeNull();
    });

    it('renders the LanguageSwitcher trigger', () => {
      renderScreen();
      expect(screen.getByLabelText('Language')).toBeDefined();
    });
  });
});

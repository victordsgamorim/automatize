import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { SettingsDialog } from '../SettingsDialog.web';
import type { SettingsDialogProps } from '../SettingsScreen.types';

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@automatize/ui/web', () => ({
  Dialog: ({
    open,
    onOpenChange,
    children,
  }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }) =>
    open ? (
      <div role="dialog">
        {children}
        <button onClick={() => onOpenChange?.(false)}>Close</button>
      </div>
    ) : null,
  DialogContent: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children?: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children?: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DropdownMenu: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
  }: {
    children?: React.ReactNode;
    asChild?: boolean;
  }) => (asChild ? <>{children}</> : <div>{children}</div>),
  DropdownMenuContent: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
  }) => <div onClick={onClick}>{children}</div>,
}));

// ── Test data ────────────────────────────────────────────────────────────────

const defaultProps: SettingsDialogProps = {
  isOpen: true,
  onClose: vi.fn(),
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

function renderDialog(props: Partial<SettingsDialogProps> = {}) {
  render(<SettingsDialog {...defaultProps} {...props} />);
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('SettingsDialog (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('open state', () => {
    it('renders dialog content when isOpen is true', () => {
      renderDialog({ isOpen: true });
      expect(screen.getByRole('dialog')).toBeDefined();
    });

    it('does not render dialog content when isOpen is false', () => {
      renderDialog({ isOpen: false });
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('header', () => {
    it('renders the title in a heading', () => {
      renderDialog();
      const title = screen.getByText('Settings');
      expect(title.tagName).toBe('H2');
    });

    it('renders the subtitle as a paragraph', () => {
      renderDialog();
      const subtitle = screen.getByText('Manage your preferences');
      expect(subtitle.tagName).toBe('P');
    });
  });

  describe('content sections', () => {
    it('renders the Appearance row', () => {
      renderDialog();
      expect(screen.getByText('Appearance')).toBeDefined();
    });

    it('renders the Language row', () => {
      renderDialog();
      expect(screen.getByText('Language')).toBeDefined();
    });

    it('renders the About row with version', () => {
      renderDialog();
      expect(screen.getByText('About')).toBeDefined();
      expect(screen.getByText('Version: 1.0.0')).toBeDefined();
    });

    it('does not render Appearance row when theme is undefined', () => {
      renderDialog({ theme: undefined });
      expect(screen.queryByText('Appearance')).toBeNull();
    });
  });

  describe('close behaviour', () => {
    it('calls onClose when dialog requests to close', () => {
      const onClose = vi.fn();
      renderDialog({ onClose });
      fireEvent.click(screen.getByText('Close'));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});

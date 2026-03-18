import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { LanguageSwitcher } from '../LanguageSwitcher.web';
import type { LanguageOption } from '../LanguageSwitcher.web';

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', ext: 'US' },
  { code: 'pt-BR', label: 'Português', ext: 'BR' },
];

function renderSwitcher(
  overrides: Partial<{
    languages: LanguageOption[];
    currentLanguage: string;
    onLanguageChange: (code: string) => void;
    triggerAriaLabel: string;
  }> = {}
) {
  const props = {
    languages: LANGUAGES,
    currentLanguage: 'en',
    onLanguageChange: vi.fn(),
    triggerAriaLabel: 'Change language',
    ...overrides,
  };
  render(<LanguageSwitcher {...props} />);
  return props;
}

describe('LanguageSwitcher (web)', () => {
  describe('trigger button', () => {
    it('renders the trigger button', () => {
      renderSwitcher();
      expect(
        screen.getByRole('button', { name: 'Change language' })
      ).toBeDefined();
    });

    it('shows the ext of the current language', () => {
      renderSwitcher({ currentLanguage: 'en' });
      expect(screen.getByRole('button').textContent).toContain('US');
    });

    it('shows the ext when the other language is current', () => {
      renderSwitcher({ currentLanguage: 'pt-BR' });
      expect(screen.getByRole('button').textContent).toContain('BR');
    });

    it('falls back to uppercased code prefix when ext is not provided', () => {
      renderSwitcher({
        languages: [{ code: 'en', label: 'English' }],
        currentLanguage: 'en',
      });
      expect(screen.getByRole('button').textContent).toContain('EN');
    });

    it('uses triggerAriaLabel as accessible name', () => {
      renderSwitcher({ triggerAriaLabel: 'Select language' });
      expect(
        screen.getByRole('button', { name: 'Select language' })
      ).toBeDefined();
    });
  });

  describe('dropdown content', () => {
    it('opens the dropdown on trigger click', async () => {
      const user = userEvent.setup();
      renderSwitcher();
      await user.click(screen.getByRole('button', { name: 'Change language' }));
      expect(screen.getByRole('menu')).toBeDefined();
    });

    it('renders all language options', async () => {
      const user = userEvent.setup();
      renderSwitcher();
      await user.click(screen.getByRole('button', { name: 'Change language' }));
      expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    });

    it('shows the label of each language', async () => {
      const user = userEvent.setup();
      renderSwitcher();
      await user.click(screen.getByRole('button', { name: 'Change language' }));
      expect(screen.getByText('English')).toBeDefined();
      expect(screen.getByText('Português')).toBeDefined();
    });

    it('shows the ext prefix of each language', async () => {
      const user = userEvent.setup();
      renderSwitcher();
      await user.click(screen.getByRole('button', { name: 'Change language' }));
      // Trigger also contains 'US', so query inside menu items only
      const items = screen.getAllByRole('menuitem');
      expect(items.some((el) => el.textContent?.includes('US'))).toBe(true);
      expect(items.some((el) => el.textContent?.includes('BR'))).toBe(true);
    });

    it('does not show ext when not provided', async () => {
      const user = userEvent.setup();
      renderSwitcher({
        languages: [
          { code: 'en', label: 'English' },
          { code: 'pt-BR', label: 'Português' },
        ],
      });
      await user.click(screen.getByRole('button', { name: 'Change language' }));
      const items = screen.getAllByRole('menuitem');
      expect(items.every((el) => !el.textContent?.includes('US'))).toBe(true);
      expect(items.every((el) => !el.textContent?.includes('BR'))).toBe(true);
    });
  });

  describe('current language indicator', () => {
    it('renders a checkmark svg for the current language item', async () => {
      const user = userEvent.setup();
      renderSwitcher({ currentLanguage: 'en' });
      await user.click(screen.getByRole('button', { name: 'Change language' }));

      const items = screen.getAllByRole('menuitem');
      const enItem = items.find((el) => el.textContent?.includes('English'));
      expect(enItem).toBeDefined();
      expect(enItem?.querySelector('svg')).not.toBeNull();
    });

    it('does not render a checkmark for non-current language items', async () => {
      const user = userEvent.setup();
      renderSwitcher({ currentLanguage: 'en' });
      await user.click(screen.getByRole('button', { name: 'Change language' }));

      const items = screen.getAllByRole('menuitem');
      const ptItem = items.find((el) => el.textContent?.includes('Português'));
      expect(ptItem).toBeDefined();
      expect(ptItem?.querySelector('svg')).toBeNull();
    });
  });

  describe('interactions', () => {
    it('calls onLanguageChange with the clicked language code', async () => {
      const user = userEvent.setup();
      const onLanguageChange = vi.fn();
      renderSwitcher({ currentLanguage: 'en', onLanguageChange });
      await user.click(screen.getByRole('button', { name: 'Change language' }));

      const items = screen.getAllByRole('menuitem');
      const ptItem = items.find((el) => el.textContent?.includes('Português'));
      expect(ptItem).toBeDefined();
      await user.click(ptItem as HTMLElement);

      expect(onLanguageChange).toHaveBeenCalledOnce();
      expect(onLanguageChange).toHaveBeenCalledWith('pt-BR');
    });

    it('calls onLanguageChange even when clicking the current language', async () => {
      const user = userEvent.setup();
      const onLanguageChange = vi.fn();
      renderSwitcher({ currentLanguage: 'en', onLanguageChange });
      await user.click(screen.getByRole('button', { name: 'Change language' }));

      const items = screen.getAllByRole('menuitem');
      const enItem = items.find((el) => el.textContent?.includes('English'));
      expect(enItem).toBeDefined();
      await user.click(enItem as HTMLElement);

      expect(onLanguageChange).toHaveBeenCalledOnce();
      expect(onLanguageChange).toHaveBeenCalledWith('en');
    });
  });
});

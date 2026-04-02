import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web DropdownMenu to avoid Radix UI portal/pointer-event issues in jsdom
vi.mock('@automatize/ui/web', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@automatize/ui/web');
  const { createElement } = await import('react');

  type WithChildren = { children?: React.ReactNode };
  type MenuItemProps = WithChildren & {
    onClick?: React.MouseEventHandler<HTMLDivElement>;
  };
  type TriggerProps = WithChildren & { asChild?: boolean };

  const DropdownMenu = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const DropdownMenuTrigger = ({ children, asChild }: TriggerProps) => {
    if (asChild) return children as React.ReactElement;
    return createElement('button', null, children);
  };
  const DropdownMenuContent = ({ children }: WithChildren) =>
    createElement('div', { 'data-slot': 'dropdown-menu-content' }, children);
  const DropdownMenuItem = ({ children, onClick }: MenuItemProps) =>
    createElement(
      'div',
      { 'data-slot': 'dropdown-menu-item', onClick, role: 'menuitem' },
      children
    );
  return {
    ...actual,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
  };
});

import {
  ThemeSwitcher,
  type ThemePreferenceOption,
  type ThemeSwitcherOption,
} from '../ThemeSwitcher.web';

function renderSwitcher(
  overrides: Partial<React.ComponentProps<typeof ThemeSwitcher>> = {}
) {
  const onPreferenceChange = vi.fn();
  const props = {
    currentPreference: 'light' as ThemePreferenceOption,
    isDark: false,
    onPreferenceChange,
    ...overrides,
  };
  const result = render(<ThemeSwitcher {...props} />);
  return { ...result, onPreferenceChange };
}

describe('ThemeSwitcher (web)', () => {
  // ── Trigger ────────────────────────────────────────────────────────────────

  it('renders a trigger button', () => {
    renderSwitcher();
    expect(screen.getByRole('button')).toBeDefined();
  });

  it('has default aria-label "Change theme"', () => {
    renderSwitcher();
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe(
      'Change theme'
    );
  });

  it('accepts a custom triggerAriaLabel', () => {
    renderSwitcher({ triggerAriaLabel: 'Toggle theme' });
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe(
      'Toggle theme'
    );
  });

  // ── Options ────────────────────────────────────────────────────────────────

  it('renders all three default options', () => {
    renderSwitcher();
    expect(screen.getByText('Light')).toBeDefined();
    expect(screen.getByText('Dark')).toBeDefined();
    expect(screen.getByText('System')).toBeDefined();
  });

  it('renders custom options when options prop is provided', () => {
    const options: ThemeSwitcherOption[] = [
      { value: 'light', label: 'Claro' },
      { value: 'dark', label: 'Escuro' },
    ];
    renderSwitcher({ options });
    expect(screen.getByText('Claro')).toBeDefined();
    expect(screen.getByText('Escuro')).toBeDefined();
    expect(screen.queryByText('System')).toBeNull();
  });

  // ── Interaction ────────────────────────────────────────────────────────────

  it('calls onPreferenceChange with "dark" when Dark option is clicked', () => {
    const { onPreferenceChange } = renderSwitcher();
    fireEvent.click(screen.getByText('Dark'));
    expect(onPreferenceChange).toHaveBeenCalledWith('dark');
  });

  it('calls onPreferenceChange with "system" when System option is clicked', () => {
    const { onPreferenceChange } = renderSwitcher();
    fireEvent.click(screen.getByText('System'));
    expect(onPreferenceChange).toHaveBeenCalledWith('system');
  });

  it('calls onPreferenceChange with "light" when Light option is clicked', () => {
    const { onPreferenceChange } = renderSwitcher();
    fireEvent.click(screen.getByText('Light'));
    expect(onPreferenceChange).toHaveBeenCalledWith('light');
  });

  // ── Check mark ─────────────────────────────────────────────────────────────

  it('shows a lucide-check icon next to the currently selected preference', () => {
    renderSwitcher({ currentPreference: 'dark' });
    const darkItem = screen
      .getByText('Dark')
      .closest('[data-slot="dropdown-menu-item"]');
    expect(darkItem?.querySelector('.lucide-check')).toBeTruthy();
  });

  it('does not show a lucide-check icon next to unselected options', () => {
    renderSwitcher({ currentPreference: 'dark' });
    const lightItem = screen
      .getByText('Light')
      .closest('[data-slot="dropdown-menu-item"]');
    expect(lightItem?.querySelector('.lucide-check')).toBeNull();
  });
});

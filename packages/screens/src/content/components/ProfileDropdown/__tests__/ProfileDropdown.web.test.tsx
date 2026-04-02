import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

/* ─── Mock @automatize/ui/web DropdownMenu primitives ──────────────────── */

vi.mock('@automatize/ui/web', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@automatize/ui/web');
  return {
    ...actual,
    DropdownMenu: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dropdown-menu">{children}</div>
    ),
    DropdownMenuTrigger: ({
      children,
    }: {
      children: React.ReactNode;
      asChild?: boolean;
    }) => <div data-testid="dropdown-trigger">{children}</div>,
    DropdownMenuContent: ({
      children,
    }: {
      children: React.ReactNode;
      side?: string;
      align?: string;
      sideOffset?: number;
      className?: string;
    }) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuItem: ({
      children,
      onClick,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: string;
    }) => (
      <div data-testid="dropdown-item" onClick={onClick}>
        {children}
      </div>
    ),
    DropdownMenuSeparator: ({ className }: { className?: string }) => (
      <hr data-testid="dropdown-separator" className={className} />
    ),
  };
});

import { ProfileDropdown } from '../ProfileDropdown.web';
import type { ProfileDropdownProps } from '../ProfileDropdown.web';

/* ─── Test data ──────────────────────────────────────────────────────────── */

function makeProps(
  overrides: Partial<ProfileDropdownProps> = {}
): ProfileDropdownProps {
  return {
    profile: {
      icon: <span data-testid="avatar-icon">A</span>,
      label: 'John Doe',
      subtitle: 'john@example.com',
    },
    menuItems: [
      {
        icon: <span>S</span>,
        label: 'Settings',
        onTap: vi.fn(),
      },
      {
        icon: <span>L</span>,
        label: 'Logout',
        onTap: vi.fn(),
        separator: true,
        variant: 'destructive' as const,
      },
    ],
    ...overrides,
  };
}

/* ─── Tests ──────────────────────────────────────────────────────────────── */

describe('ProfileDropdown (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Trigger ─────────────────────────────────────────────────────────────

  describe('trigger', () => {
    it('renders trigger button with data-slot="profile-dropdown-trigger"', () => {
      render(<ProfileDropdown {...makeProps()} />);
      expect(
        document.querySelector('[data-slot="profile-dropdown-trigger"]')
      ).toBeTruthy();
    });

    it('renders trigger as a button element', () => {
      render(<ProfileDropdown {...makeProps()} />);
      const trigger = document.querySelector(
        '[data-slot="profile-dropdown-trigger"]'
      ) as HTMLElement;
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('sets aria-label from profile.label', () => {
      render(<ProfileDropdown {...makeProps()} />);
      const trigger = document.querySelector(
        '[data-slot="profile-dropdown-trigger"]'
      ) as HTMLElement;
      expect(trigger.getAttribute('aria-label')).toBe('John Doe');
    });

    it('renders profile icon inside trigger', () => {
      render(<ProfileDropdown {...makeProps()} />);
      expect(screen.getByTestId('avatar-icon')).toBeDefined();
    });

    it('has type="button"', () => {
      render(<ProfileDropdown {...makeProps()} />);
      const trigger = document.querySelector(
        '[data-slot="profile-dropdown-trigger"]'
      ) as HTMLButtonElement;
      expect(trigger.type).toBe('button');
    });
  });

  // ── Menu items ──────────────────────────────────────────────────────────

  describe('menu items', () => {
    it('renders all menu item labels', () => {
      render(<ProfileDropdown {...makeProps()} />);
      expect(screen.getByText('Settings')).toBeDefined();
      expect(screen.getByText('Logout')).toBeDefined();
    });

    it('renders item icons', () => {
      render(<ProfileDropdown {...makeProps()} />);
      expect(screen.getByText('S')).toBeDefined();
      expect(screen.getByText('L')).toBeDefined();
    });

    it('renders correct number of menu items', () => {
      render(<ProfileDropdown {...makeProps()} />);
      const items = screen.getAllByTestId('dropdown-item');
      expect(items).toHaveLength(2);
    });
  });

  // ── Separators ──────────────────────────────────────────────────────────

  describe('separators', () => {
    it('renders separator when item.separator is true', () => {
      render(<ProfileDropdown {...makeProps()} />);
      const separators = screen.getAllByTestId('dropdown-separator');
      expect(separators).toHaveLength(1);
    });

    it('does not render separator when item.separator is false/undefined', () => {
      render(
        <ProfileDropdown
          {...makeProps({
            menuItems: [
              { icon: <span>S</span>, label: 'Settings', onTap: vi.fn() },
            ],
          })}
        />
      );
      expect(screen.queryByTestId('dropdown-separator')).toBeNull();
    });
  });

  // ── Callbacks ─────────────────────────────────────────────────────────

  describe('callbacks', () => {
    it('calls item.onTap when menu item is clicked', () => {
      const onTapSettings = vi.fn();
      render(
        <ProfileDropdown
          {...makeProps({
            menuItems: [
              {
                icon: <span>S</span>,
                label: 'Settings',
                onTap: onTapSettings,
              },
            ],
          })}
        />
      );
      fireEvent.click(screen.getByText('Settings'));
      expect(onTapSettings).toHaveBeenCalledOnce();
    });

    it('calls correct onTap for each item', () => {
      const onTapA = vi.fn();
      const onTapB = vi.fn();
      render(
        <ProfileDropdown
          {...makeProps({
            menuItems: [
              { icon: <span>A</span>, label: 'Action A', onTap: onTapA },
              { icon: <span>B</span>, label: 'Action B', onTap: onTapB },
            ],
          })}
        />
      );
      fireEvent.click(screen.getByText('Action A'));
      expect(onTapA).toHaveBeenCalledOnce();
      expect(onTapB).not.toHaveBeenCalled();

      fireEvent.click(screen.getByText('Action B'));
      expect(onTapB).toHaveBeenCalledOnce();
    });
  });
});

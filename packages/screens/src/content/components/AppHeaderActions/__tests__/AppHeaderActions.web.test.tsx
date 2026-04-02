import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

/* ─── Capture props passed to mocked components ──────────────────────────── */

let capturedDateRangePickerProps: Record<string, unknown> | null = null;

vi.mock('@automatize/ui/web', () => ({
  DateRangePicker: (props: Record<string, unknown>) => {
    capturedDateRangePickerProps = props;
    return <div data-testid="date-range-picker" />;
  },
  SearchBar: (props: Record<string, unknown>) => (
    <div data-testid="search-bar" data-placeholder={props.placeholder} />
  ),
}));

vi.mock('../../ProfileDropdown/ProfileDropdown.web', () => ({
  ProfileDropdown: (props: { profile: { label: string } }) => (
    <div data-testid="profile-dropdown" aria-label={props.profile.label} />
  ),
}));

vi.mock('date-fns/locale/pt-BR', () => ({
  ptBR: { code: 'pt-BR' },
}));

import { AppHeaderActions } from '../AppHeaderActions.web';
import type { AppHeaderActionsProps } from '../AppHeaderActions.types';

/* ─── Test data ──────────────────────────────────────────────────────────── */

function makeProps(
  overrides: Partial<AppHeaderActionsProps> = {}
): AppHeaderActionsProps {
  return {
    locale: { code: 'en', label: 'English' },
    dateRangePickerProps: {} as AppHeaderActionsProps['dateRangePickerProps'],
    searchBarProps: {},
    ...overrides,
  };
}

/* ─── Tests ──────────────────────────────────────────────────────────────── */

describe('AppHeaderActions (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedDateRangePickerProps = null;
  });

  // ── Rendering ─────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders DateRangePicker', () => {
      render(<AppHeaderActions {...makeProps()} />);
      expect(screen.getByTestId('date-range-picker')).toBeDefined();
    });

    it('renders SearchBar', () => {
      render(<AppHeaderActions {...makeProps()} />);
      expect(screen.getByTestId('search-bar')).toBeDefined();
    });
  });

  // ── ProfileDropdown ───────────────────────────────────────────────────

  describe('ProfileDropdown', () => {
    it('renders ProfileDropdown when both profile and profileMenuItems are provided', () => {
      render(
        <AppHeaderActions
          {...makeProps({
            profile: {
              icon: <span>A</span>,
              label: 'John Doe',
            },
            profileMenuItems: [
              { icon: <span>S</span>, label: 'Settings', onTap: vi.fn() },
            ],
          })}
        />
      );
      expect(screen.getByTestId('profile-dropdown')).toBeDefined();
    });

    it('does not render ProfileDropdown when profile is missing', () => {
      render(
        <AppHeaderActions
          {...makeProps({
            profileMenuItems: [
              { icon: <span>S</span>, label: 'Settings', onTap: vi.fn() },
            ],
          })}
        />
      );
      expect(screen.queryByTestId('profile-dropdown')).toBeNull();
    });

    it('does not render ProfileDropdown when profileMenuItems is missing', () => {
      render(
        <AppHeaderActions
          {...makeProps({
            profile: {
              icon: <span>A</span>,
              label: 'John Doe',
            },
          })}
        />
      );
      expect(screen.queryByTestId('profile-dropdown')).toBeNull();
    });

    it('does not render ProfileDropdown when neither profile nor profileMenuItems are provided', () => {
      render(<AppHeaderActions {...makeProps()} />);
      expect(screen.queryByTestId('profile-dropdown')).toBeNull();
    });
  });

  // ── Locale mapping ────────────────────────────────────────────────────

  describe('locale', () => {
    it('passes ptBR locale to DateRangePicker when locale.code is "pt-BR"', () => {
      render(
        <AppHeaderActions
          {...makeProps({ locale: { code: 'pt-BR', label: 'Portugues' } })}
        />
      );
      expect(capturedDateRangePickerProps?.locale).toEqual({ code: 'pt-BR' });
    });

    it('passes undefined locale to DateRangePicker for non-pt-BR locales', () => {
      render(
        <AppHeaderActions
          {...makeProps({ locale: { code: 'en', label: 'English' } })}
        />
      );
      expect(capturedDateRangePickerProps?.locale).toBeUndefined();
    });
  });
});

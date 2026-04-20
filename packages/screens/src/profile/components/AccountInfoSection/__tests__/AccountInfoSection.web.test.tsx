import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web
vi.mock('@automatize/ui/web', async () => {
  const { createElement } = await import('react');

  type _WithChildren = { children?: React.ReactNode };

  const Text = ({
    variant,
    color,
    className,
    children,
  }: {
    variant?: string;
    color?: string;
    className?: string;
    children?: React.ReactNode;
  }) => createElement('span', { variant, color, className }, children);

  return {
    Text,
  };
});

vi.mock('lucide-react', () => ({
  Mail: () => React.createElement('span', { 'data-testid': 'mail-icon' }),
  Building2: () =>
    React.createElement('span', { 'data-testid': 'building-icon' }),
  Lock: () => React.createElement('span', { 'data-testid': 'lock-icon' }),
}));

// Mock useTranslation
vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { AccountInfoSection } from '../AccountInfoSection.web';

function renderAccountInfoSection(
  overrides: Partial<React.ComponentProps<typeof AccountInfoSection>> = {}
) {
  const props = {
    email: 'test@example.com',
    companyName: 'Test Company',
    ...overrides,
  };

  return render(<AccountInfoSection {...props} />);
}

describe('AccountInfoSection (web)', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────
  it('renders section title', () => {
    renderAccountInfoSection();
    expect(screen.getByText(/profile.section.account/i)).toBeDefined();
  });

  it('renders email field with value', () => {
    renderAccountInfoSection();
    expect(screen.getByText('test@example.com')).toBeDefined();
    expect(screen.getByText(/profile.email/i)).toBeDefined();
  });

  it('renders company name field with value', () => {
    renderAccountInfoSection();
    expect(screen.getByText('Test Company')).toBeDefined();
    expect(screen.getByText(/profile.company/i)).toBeDefined();
  });

  it('renders mail icon', () => {
    renderAccountInfoSection();
    expect(screen.getByTestId('mail-icon')).toBeDefined();
  });

  it('renders building icon', () => {
    renderAccountInfoSection();
    expect(screen.getByTestId('building-icon')).toBeDefined();
  });

  it('renders lock icons', () => {
    renderAccountInfoSection();
    const lockIcons = screen.getAllByTestId('lock-icon');
    expect(lockIcons).toHaveLength(2);
  });
});

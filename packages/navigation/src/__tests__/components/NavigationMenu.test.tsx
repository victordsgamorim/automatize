import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import type { NavigationMenuItem, NavigationMenuGroup } from '../../types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <a href={href} onClick={onClick} data-testid={`link-${href}`} {...props}>
      {children}
    </a>
  ),
}));

import { NavigationMenu } from '../../components/NavigationMenu.web';

const flatItems: NavigationMenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/' },
  { key: 'invoices', label: 'Invoices', href: '/invoices' },
  { key: 'clients', label: 'Clients', href: '/clients' },
];

const groupedItems: NavigationMenuGroup[] = [
  {
    title: 'Overview',
    items: [
      { key: 'dashboard', label: 'Dashboard', href: '/' },
      { key: 'invoices', label: 'Invoices', href: '/invoices' },
    ],
  },
  {
    title: 'Settings',
    items: [{ key: 'settings', label: 'Settings', href: '/settings' }],
  },
];

describe('NavigationMenu (web)', () => {
  beforeEach(() => {
    mockPathname = '/';
    vi.clearAllMocks();
  });

  it('renders all flat items', () => {
    render(<NavigationMenu items={flatItems} />);
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Invoices')).toBeDefined();
    expect(screen.getByText('Clients')).toBeDefined();
  });

  it('renders grouped items with section titles', () => {
    render(<NavigationMenu items={groupedItems} />);
    expect(screen.getByText('Overview')).toBeDefined();
    // "Settings" appears as both group title and item label — use getAllByText
    expect(screen.getAllByText('Settings').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Dashboard')).toBeDefined();
  });

  it('marks the active item with aria-current="page"', () => {
    mockPathname = '/invoices';
    render(<NavigationMenu items={flatItems} />);

    const invoicesLink = screen.getByTestId('link-/invoices');
    expect(invoicesLink.getAttribute('aria-current')).toBe('page');

    const dashboardLink = screen.getByTestId('link-/');
    expect(dashboardLink.getAttribute('aria-current')).toBeNull();
  });

  it('calls onItemSelect when an item is clicked', () => {
    const onItemSelect = vi.fn();
    render(<NavigationMenu items={flatItems} onItemSelect={onItemSelect} />);

    fireEvent.click(screen.getByTestId('link-/invoices'));
    expect(onItemSelect).toHaveBeenCalledWith(flatItems[1]);
  });

  it('renders badges when provided', () => {
    const itemsWithBadge: NavigationMenuItem[] = [
      { key: 'invoices', label: 'Invoices', href: '/invoices', badge: 5 },
    ];
    render(<NavigationMenu items={itemsWithBadge} />);
    expect(screen.getByText('5')).toBeDefined();
  });

  it('renders icons when provided', () => {
    const itemsWithIcon: NavigationMenuItem[] = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        href: '/',
        icon: <span data-testid="icon">IC</span>,
      },
    ];
    render(<NavigationMenu items={itemsWithIcon} />);
    expect(screen.getByTestId('icon')).toBeDefined();
  });

  it('has role="navigation" for accessibility', () => {
    const { container } = render(<NavigationMenu items={flatItems} />);
    const nav = container.querySelector('nav');
    expect(nav).toBeDefined();
    expect(nav?.getAttribute('role')).toBe('navigation');
  });
});

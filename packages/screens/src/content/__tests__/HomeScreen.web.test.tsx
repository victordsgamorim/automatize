import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { HomeScreen } from '../HomeScreen.web';
import type { HomeScreenProps, HomeScreenItem } from '../HomeScreen.types';

/* ─── Mocks ───────────────────────────────────────────────────────────────── */

interface MockNavItem {
  label: string;
  icon: React.ReactNode;
  group?: string;
  onTap: () => void;
}

interface MockSidebarLayoutProps {
  header?: React.ReactNode;
  items: MockNavItem[];
  activeIndex: number;
  profile?: { icon: React.ReactNode; label: string; subtitle?: string };
  profileMenuItems?: Array<{
    icon: React.ReactNode;
    label: string;
    onTap: () => void;
  }>;
}

let capturedSidebarLayoutProps: MockSidebarLayoutProps | null = null;

vi.mock('@automatize/ui/web', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarLayout: (props: MockSidebarLayoutProps) => {
    capturedSidebarLayoutProps = props;
    return (
      <nav data-testid="sidebar-layout" data-active-index={props.activeIndex}>
        {props.header && <div data-testid="sidebar-header">{props.header}</div>}
        {props.items.map((item, i) => (
          <button key={i} data-testid={`nav-item-${i}`} onClick={item.onTap}>
            {item.label}
          </button>
        ))}
        {props.profile && (
          <div data-testid="sidebar-profile">{props.profile.label}</div>
        )}
      </nav>
    );
  },
}));

/* ─── Test data ────────────────────────────────────────────────────────────── */

const mockItems: HomeScreenItem[] = [
  {
    id: 'dashboard',
    icon: <span data-testid="icon-dashboard">D</span>,
    label: 'Dashboard',
    route: '/',
    group: 'Menu',
  },
  {
    id: 'invoices',
    icon: <span data-testid="icon-invoices">I</span>,
    label: 'Invoices',
    route: '/invoices',
    group: 'Menu',
  },
  {
    id: 'products',
    icon: <span data-testid="icon-products">P</span>,
    label: 'Products',
    route: '/products',
  },
];

const defaultProps: HomeScreenProps = {
  items: mockItems,
  activeTile: 'dashboard',
  onNavigate: vi.fn(),
  header: <div data-testid="header-logo">Logo</div>,
  children: <div data-testid="main-content">Page content</div>,
};

/* ─── Tests ────────────────────────────────────────────────────────────────── */

describe('HomeScreen (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSidebarLayoutProps = null;
  });

  describe('rendering', () => {
    it('wraps content in SidebarProvider', () => {
      render(<HomeScreen {...defaultProps} />);
      expect(screen.getByTestId('sidebar-provider')).toBeDefined();
    });

    it('renders all navigation items', () => {
      render(<HomeScreen {...defaultProps} />);
      expect(screen.getByText('Dashboard')).toBeDefined();
      expect(screen.getByText('Invoices')).toBeDefined();
      expect(screen.getByText('Products')).toBeDefined();
    });

    it('renders header slot in sidebar', () => {
      render(<HomeScreen {...defaultProps} />);
      expect(screen.getByTestId('header-logo')).toBeDefined();
      expect(screen.getByText('Logo')).toBeDefined();
    });

    it('renders children in main content area', () => {
      render(<HomeScreen {...defaultProps} />);
      const main = document.querySelector('main') as HTMLElement;
      expect(main).toBeDefined();
      expect(screen.getByTestId('main-content')).toBeDefined();
      expect(screen.getByText('Page content')).toBeDefined();
    });

    it('renders profile when provided', () => {
      render(
        <HomeScreen
          {...defaultProps}
          profile={{
            icon: <div>Avatar</div>,
            label: 'John Doe',
            subtitle: 'john@example.com',
          }}
        />
      );
      expect(screen.getByTestId('sidebar-profile')).toBeDefined();
      expect(screen.getByText('John Doe')).toBeDefined();
    });
  });

  describe('active tile', () => {
    it('sets activeIndex based on activeTile id', () => {
      render(<HomeScreen {...defaultProps} activeTile="invoices" />);
      const sidebar = screen.getByTestId('sidebar-layout');
      expect(sidebar.getAttribute('data-active-index')).toBe('1');
    });

    it('defaults activeIndex to 0 when activeTile does not match any item', () => {
      render(<HomeScreen {...defaultProps} activeTile="unknown" />);
      const sidebar = screen.getByTestId('sidebar-layout');
      expect(sidebar.getAttribute('data-active-index')).toBe('0');
    });

    it('sets activeIndex to 0 for the first item', () => {
      render(<HomeScreen {...defaultProps} activeTile="dashboard" />);
      const sidebar = screen.getByTestId('sidebar-layout');
      expect(sidebar.getAttribute('data-active-index')).toBe('0');
    });
  });

  describe('navigation', () => {
    it('calls onNavigate with id and route when an item is clicked', () => {
      const onNavigate = vi.fn();
      render(<HomeScreen {...defaultProps} onNavigate={onNavigate} />);
      fireEvent.click(screen.getByTestId('nav-item-1'));
      expect(onNavigate).toHaveBeenCalledOnce();
      expect(onNavigate).toHaveBeenCalledWith('invoices', '/invoices');
    });

    it('calls onNavigate with correct args for each item', () => {
      const onNavigate = vi.fn();
      render(<HomeScreen {...defaultProps} onNavigate={onNavigate} />);

      fireEvent.click(screen.getByTestId('nav-item-0'));
      expect(onNavigate).toHaveBeenCalledWith('dashboard', '/');

      fireEvent.click(screen.getByTestId('nav-item-2'));
      expect(onNavigate).toHaveBeenCalledWith('products', '/products');
    });
  });

  describe('item mapping', () => {
    it('passes group labels to SidebarLayout items', () => {
      render(<HomeScreen {...defaultProps} />);
      const items = capturedSidebarLayoutProps?.items ?? [];
      expect(items[0]?.group).toBe('Menu');
      expect(items[1]?.group).toBe('Menu');
      expect(items[2]?.group).toBeUndefined();
    });

    it('passes profile and profileMenuItems to SidebarLayout', () => {
      const profile = {
        icon: <div>A</div>,
        label: 'Jane',
        subtitle: 'jane@example.com',
      };
      const profileMenuItems = [
        { icon: <div>S</div>, label: 'Settings', onTap: vi.fn() },
      ];
      render(
        <HomeScreen
          {...defaultProps}
          profile={profile}
          profileMenuItems={profileMenuItems}
        />
      );
      expect(capturedSidebarLayoutProps?.profile).toBe(profile);
      expect(capturedSidebarLayoutProps?.profileMenuItems).toBe(
        profileMenuItems
      );
    });
  });

  describe('optional props', () => {
    it('renders without profile', () => {
      render(<HomeScreen {...defaultProps} profile={undefined} />);
      expect(screen.getByTestId('sidebar-layout')).toBeDefined();
      expect(screen.queryByTestId('sidebar-profile')).toBeNull();
    });

    it('renders without profileMenuItems', () => {
      render(<HomeScreen {...defaultProps} profileMenuItems={undefined} />);
      expect(screen.getByTestId('sidebar-layout')).toBeDefined();
    });
  });
});

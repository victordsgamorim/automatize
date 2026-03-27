import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { HomeScreen } from '../HomeScreen.web';
import type { HomeScreenProps } from '../HomeScreen.types';
import type { SidebarProps, SidebarNavItem } from '@automatize/ui/web';

/* ─── Mocks ───────────────────────────────────────────────────────────────── */

interface MockSidebarLayoutProps {
  items: SidebarNavItem[];
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
  SidebarLogo: () => <div data-testid="sidebar-logo" />,
  SidebarLayout: (props: MockSidebarLayoutProps) => {
    capturedSidebarLayoutProps = props;
    return (
      <nav data-testid="sidebar-layout" data-active-index={props.activeIndex}>
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

const onTapDashboard = vi.fn();
const onTapInvoices = vi.fn();
const onTapProducts = vi.fn();

const defaultSidebar: SidebarProps = {
  items: [
    {
      icon: <span data-testid="icon-dashboard">D</span>,
      label: 'Dashboard',
      group: 'Menu',
      onTap: onTapDashboard,
    },
    {
      icon: <span data-testid="icon-invoices">I</span>,
      label: 'Invoices',
      group: 'Menu',
      onTap: onTapInvoices,
    },
    {
      icon: <span data-testid="icon-products">P</span>,
      label: 'Products',
      onTap: onTapProducts,
    },
  ],
  activeIndex: 0,
};

const defaultProps: HomeScreenProps = {
  navProps: defaultSidebar,
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

    it('renders SidebarLogo in sidebar', () => {
      render(<HomeScreen {...defaultProps} />);
      expect(screen.getByTestId('sidebar-logo')).toBeDefined();
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
          navProps={{
            ...defaultSidebar,
            profile: {
              icon: <div>Avatar</div>,
              label: 'John Doe',
              subtitle: 'john@example.com',
            },
          }}
        />
      );
      expect(screen.getByTestId('sidebar-profile')).toBeDefined();
      expect(screen.getByText('John Doe')).toBeDefined();
    });
  });

  describe('active index', () => {
    it('passes activeIndex to SidebarLayout', () => {
      render(
        <HomeScreen
          {...defaultProps}
          navProps={{ ...defaultSidebar, activeIndex: 1 }}
        />
      );
      const sidebar = screen.getByTestId('sidebar-layout');
      expect(sidebar.getAttribute('data-active-index')).toBe('1');
    });

    it('passes activeIndex 0 for the first item', () => {
      render(<HomeScreen {...defaultProps} />);
      const sidebar = screen.getByTestId('sidebar-layout');
      expect(sidebar.getAttribute('data-active-index')).toBe('0');
    });
  });

  describe('navigation', () => {
    it('calls item onTap when clicked', () => {
      render(<HomeScreen {...defaultProps} />);
      fireEvent.click(screen.getByTestId('nav-item-1'));
      expect(onTapInvoices).toHaveBeenCalledOnce();
    });

    it('calls correct onTap for each item', () => {
      render(<HomeScreen {...defaultProps} />);
      fireEvent.click(screen.getByTestId('nav-item-0'));
      expect(onTapDashboard).toHaveBeenCalledOnce();

      fireEvent.click(screen.getByTestId('nav-item-2'));
      expect(onTapProducts).toHaveBeenCalledOnce();
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
          navProps={{ ...defaultSidebar, profile, profileMenuItems }}
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
      render(
        <HomeScreen
          {...defaultProps}
          navProps={{ ...defaultSidebar, profile: undefined }}
        />
      );
      expect(screen.getByTestId('sidebar-layout')).toBeDefined();
      expect(screen.queryByTestId('sidebar-profile')).toBeNull();
    });

    it('renders without profileMenuItems', () => {
      render(
        <HomeScreen
          {...defaultProps}
          navProps={{ ...defaultSidebar, profileMenuItems: undefined }}
        />
      );
      expect(screen.getByTestId('sidebar-layout')).toBeDefined();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

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

const mockUseSidebar = vi.fn().mockReturnValue({
  isMobile: false,
  open: true,
  setOpen: vi.fn(),
  toggle: vi.fn(),
});

vi.mock('../components/SidebarLogo/SidebarLogo.web', () => ({
  SidebarLogo: () => <div data-testid="sidebar-logo" />,
}));

vi.mock('@automatize/ui/web', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarLayout: (
    props: MockSidebarLayoutProps & { header?: React.ReactNode }
  ) => {
    capturedSidebarLayoutProps = props;
    return (
      <nav data-testid="sidebar-layout" data-active-index={props.activeIndex}>
        {props.header}
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
  Header: ({
    title,
    actions,
  }: {
    title: string;
    actions?: React.ReactNode;
    className?: string;
  }) => (
    <header data-testid="header">
      <span>{title}</span>
      {actions && <div data-testid="header-actions">{actions}</div>}
    </header>
  ),
  BottomNavigation: ({
    items,
    activeIndex,
  }: {
    items: SidebarNavItem[];
    activeIndex: number;
  }) => (
    <nav data-testid="bottom-navigation" data-active-index={activeIndex}>
      {items.map((item, i) => (
        <button
          key={i}
          data-testid={`bottom-nav-item-${i}`}
          onClick={item.onTap}
        >
          {item.label}
        </button>
      ))}
    </nav>
  ),
  DateRangePicker: (props: Record<string, unknown>) => (
    <div data-testid="date-range-picker" {...props} />
  ),
  SearchBar: (props: Record<string, unknown>) => (
    <div data-testid="search-bar" {...props} />
  ),
  useSidebar: () => mockUseSidebar() as Record<string, unknown>,
}));

vi.mock('../components/AppHeaderActions/AppHeaderActions.web', () => ({
  AppHeaderActions: (props: Record<string, unknown>) => (
    <div data-testid="app-header-actions" data-has-profile={!!props.profile} />
  ),
}));

import { HomeScreen } from '../HomeScreen.web';

/* ─── Test data ───────────────────────────────────────────────────────────── */

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

/* ─── Tests ───────────────────────────────────────────────────────────────── */

describe('HomeScreen (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSidebarLayoutProps = null;
    mockUseSidebar.mockReturnValue({
      isMobile: false,
      open: true,
      setOpen: vi.fn(),
      toggle: vi.fn(),
    });
  });

  describe('rendering', () => {
    it('wraps content in SidebarProvider', () => {
      render(<HomeScreen {...defaultProps} />);
      expect(screen.getByTestId('sidebar-provider')).toBeDefined();
    });

    it('renders all navigation items in sidebar on desktop', () => {
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

    it('passes negative activeIndex when no sidebar item matches (e.g. settings page)', () => {
      render(
        <HomeScreen
          {...defaultProps}
          navProps={{ ...defaultSidebar, activeIndex: -1 }}
        />
      );
      const sidebar = screen.getByTestId('sidebar-layout');
      expect(sidebar.getAttribute('data-active-index')).toBe('-1');
    });

    it('passes negative activeIndex to BottomNavigation on mobile', () => {
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        open: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(
        <HomeScreen
          {...defaultProps}
          navProps={{ ...defaultSidebar, activeIndex: -1 }}
        />
      );
      const bottomNav = screen.getByTestId('bottom-navigation');
      expect(bottomNav.getAttribute('data-active-index')).toBe('-1');
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

  describe('mobile layout', () => {
    it('hides sidebar and shows BottomNavigation on mobile', () => {
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        open: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(<HomeScreen {...defaultProps} />);
      expect(screen.queryByTestId('sidebar-layout')).toBeNull();
      expect(screen.getByTestId('bottom-navigation')).toBeDefined();
    });

    it('shows sidebar and hides BottomNavigation on desktop', () => {
      render(<HomeScreen {...defaultProps} />);
      expect(screen.getByTestId('sidebar-layout')).toBeDefined();
      expect(screen.queryByTestId('bottom-navigation')).toBeNull();
    });

    it('passes activeIndex to BottomNavigation on mobile', () => {
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        open: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(
        <HomeScreen
          {...defaultProps}
          navProps={{ ...defaultSidebar, activeIndex: 2 }}
        />
      );
      const bottomNav = screen.getByTestId('bottom-navigation');
      expect(bottomNav.getAttribute('data-active-index')).toBe('2');
    });

    it('never renders both sidebar and bottom navigation at the same time', () => {
      // Desktop: sidebar visible, no bottom nav
      const { unmount: unmountDesktop } = render(
        <HomeScreen {...defaultProps} />
      );
      expect(screen.queryByTestId('sidebar-layout')).not.toBeNull();
      expect(screen.queryByTestId('bottom-navigation')).toBeNull();
      unmountDesktop();

      // Mobile: bottom nav visible, no sidebar
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        open: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(<HomeScreen {...defaultProps} />);
      expect(screen.queryByTestId('sidebar-layout')).toBeNull();
      expect(screen.queryByTestId('bottom-navigation')).not.toBeNull();
    });

    it('always has at least one navigation visible (no gap between breakpoints)', () => {
      // Simulate desktop state
      mockUseSidebar.mockReturnValue({
        isMobile: false,
        open: true,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      const { unmount: unmountDesktop } = render(
        <HomeScreen {...defaultProps} />
      );
      const hasSidebar = screen.queryByTestId('sidebar-layout') !== null;
      const hasBottomNav = screen.queryByTestId('bottom-navigation') !== null;
      expect(hasSidebar || hasBottomNav).toBe(true);
      unmountDesktop();

      // Simulate mobile state
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        open: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      const { unmount: unmountMobile } = render(
        <HomeScreen {...defaultProps} />
      );
      const hasSidebarMobile = screen.queryByTestId('sidebar-layout') !== null;
      const hasBottomNavMobile =
        screen.queryByTestId('bottom-navigation') !== null;
      expect(hasSidebarMobile || hasBottomNavMobile).toBe(true);
      unmountMobile();
    });

    it('passes the same navigation items to both sidebar and bottom navigation', () => {
      // Desktop: check sidebar receives items
      const { unmount: unmountDesktop } = render(
        <HomeScreen {...defaultProps} />
      );
      const sidebarItems = capturedSidebarLayoutProps?.items ?? [];
      expect(sidebarItems).toHaveLength(3);
      expect(sidebarItems[0]?.label).toBe('Dashboard');
      expect(sidebarItems[1]?.label).toBe('Invoices');
      expect(sidebarItems[2]?.label).toBe('Products');
      unmountDesktop();

      // Mobile: check bottom navigation receives the same items
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        open: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(<HomeScreen {...defaultProps} />);
      expect(screen.getByTestId('bottom-nav-item-0').textContent).toBe(
        'Dashboard'
      );
      expect(screen.getByTestId('bottom-nav-item-1').textContent).toBe(
        'Invoices'
      );
      expect(screen.getByTestId('bottom-nav-item-2').textContent).toBe(
        'Products'
      );
    });

    it('preserves activeIndex when switching between sidebar and bottom navigation', () => {
      const activeIndex = 1;
      const propsWithActive = {
        ...defaultProps,
        navProps: { ...defaultSidebar, activeIndex },
      };

      // Desktop: sidebar has correct active index
      const { unmount: unmountDesktop } = render(
        <HomeScreen {...propsWithActive} />
      );
      expect(
        screen.getByTestId('sidebar-layout').getAttribute('data-active-index')
      ).toBe('1');
      unmountDesktop();

      // Mobile: bottom navigation has the same active index
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        open: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(<HomeScreen {...propsWithActive} />);
      expect(
        screen
          .getByTestId('bottom-navigation')
          .getAttribute('data-active-index')
      ).toBe('1');
    });
  });

  describe('page header', () => {
    it('renders Header when pageHeaderProps is provided', () => {
      render(
        <HomeScreen
          {...defaultProps}
          pageHeaderProps={{
            title: 'Page Title',
            locale: { code: 'en', label: 'English' },
            dateRangePickerProps:
              {} as HomeScreenProps['pageHeaderProps'] extends infer T
                ? T extends { dateRangePickerProps: infer D }
                  ? D
                  : never
                : never,
            searchBarProps: {},
          }}
        />
      );
      expect(screen.getByTestId('header')).toBeDefined();
      expect(screen.getByText('Page Title')).toBeDefined();
    });

    it('renders a non-navigation page title in the header (e.g. Settings)', () => {
      render(
        <HomeScreen
          {...defaultProps}
          navProps={{ ...defaultSidebar, activeIndex: -1 }}
          pageHeaderProps={{
            title: 'Settings',
            locale: { code: 'en', label: 'English' },
            dateRangePickerProps:
              {} as HomeScreenProps['pageHeaderProps'] extends infer T
                ? T extends { dateRangePickerProps: infer D }
                  ? D
                  : never
                : never,
            searchBarProps: {},
          }}
        />
      );
      expect(screen.getByText('Settings')).toBeDefined();
      const sidebar = screen.getByTestId('sidebar-layout');
      expect(sidebar.getAttribute('data-active-index')).toBe('-1');
    });

    it('does not render Header when pageHeaderProps is undefined', () => {
      render(<HomeScreen {...defaultProps} />);
      expect(screen.queryByTestId('header')).toBeNull();
    });

    it('renders AppHeaderActions inside Header actions', () => {
      render(
        <HomeScreen
          {...defaultProps}
          pageHeaderProps={{
            title: 'Page',
            locale: { code: 'en', label: 'English' },
            dateRangePickerProps:
              {} as HomeScreenProps['pageHeaderProps'] extends infer T
                ? T extends { dateRangePickerProps: infer D }
                  ? D
                  : never
                : never,
            searchBarProps: {},
          }}
        />
      );
      expect(screen.getByTestId('app-header-actions')).toBeDefined();
    });

    it('passes profile to AppHeaderActions on mobile', () => {
      mockUseSidebar.mockReturnValue({
        isMobile: true,
        open: false,
        setOpen: vi.fn(),
        toggle: vi.fn(),
      });
      render(
        <HomeScreen
          {...defaultProps}
          navProps={{
            ...defaultSidebar,
            profile: { icon: <div>A</div>, label: 'Jane' },
          }}
          pageHeaderProps={{
            title: 'Page',
            locale: { code: 'en', label: 'English' },
            dateRangePickerProps:
              {} as HomeScreenProps['pageHeaderProps'] extends infer T
                ? T extends { dateRangePickerProps: infer D }
                  ? D
                  : never
                : never,
            searchBarProps: {},
          }}
        />
      );
      const actions = screen.getByTestId('app-header-actions');
      expect(actions.getAttribute('data-has-profile')).toBe('true');
    });

    it('does not pass profile to AppHeaderActions on desktop', () => {
      render(
        <HomeScreen
          {...defaultProps}
          navProps={{
            ...defaultSidebar,
            profile: { icon: <div>A</div>, label: 'Jane' },
          }}
          pageHeaderProps={{
            title: 'Page',
            locale: { code: 'en', label: 'English' },
            dateRangePickerProps:
              {} as HomeScreenProps['pageHeaderProps'] extends infer T
                ? T extends { dateRangePickerProps: infer D }
                  ? D
                  : never
                : never,
            searchBarProps: {},
          }}
        />
      );
      const actions = screen.getByTestId('app-header-actions');
      expect(actions.getAttribute('data-has-profile')).toBe('false');
    });
  });
});

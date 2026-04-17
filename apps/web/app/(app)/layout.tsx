'use client';

import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { useUserAuthentication } from '@automatize/supabase-auth';
import {
  useNavigation,
  useRoute,
  buildRouteToIdMap,
  resolveActiveTile,
  resolvePageTitle,
  resolveNavigationTarget,
} from '@automatize/navigation';
import { useTranslation } from '@automatize/localization';
import type {
  SidebarProps,
  SidebarProfileConfig,
  SidebarProfileMenuItem,
} from '@automatize/ui/web';
import { HomeScreen } from '@automatize/screens/content/web';
import type { HomeScreenItem } from '@automatize/screens/content/web';
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Settings,
  LogOut,
  UserCog,
} from 'lucide-react';

/* ─── Tile definitions ─────────────────────────────────────────────────────── */

const ITEMS: HomeScreenItem[] = [
  {
    id: 'dashboard',
    icon: <LayoutDashboard className="size-5" />,
    label: 'Dashboard',
    route: '/',
    group: 'Menu',
  },
  {
    id: 'invoices',
    icon: <FileText className="size-5" />,
    label: 'Invoices',
    route: '/invoices',
    group: 'Menu',
  },
  {
    id: 'products',
    icon: <Package className="size-5" />,
    label: 'Products',
    route: '/products',
    group: 'Menu',
  },
  {
    id: 'clients',
    icon: <Users className="size-5" />,
    label: 'Clients',
    route: '/clients',
    group: 'Menu',
  },
];

const ROUTE_TO_ID = buildRouteToIdMap(ITEMS);

/* ─── Inner layout — owns all route-aware logic (useRoute → useSearchParams) ── */

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, userProfile, currentTenant } =
    useUserAuthentication();
  const { navigate } = useNavigation();
  const { path: pathname } = useRoute();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { t, i18n } = useTranslation();

  const lastVisitedRef = useRef<Record<string, string>>({});

  const activeTile = resolveActiveTile(pathname, ITEMS, ROUTE_TO_ID);

  useEffect(() => {
    if (activeTile) {
      lastVisitedRef.current[activeTile] = pathname;
    }
  }, [activeTile, pathname]);

  const SUB_ROUTE_TITLES: Record<string, string> = {
    '/clients/new': t('client.form.title'),
    '/clients/edit': t('client.form.title.edit'),
    '/products/new': t('product.form.title'),
    '/products/edit': t('product.form.title.edit'),
    '/settings': t('settings.title'),
    '/profile': t('profile.form.title'),
  };

  const pageTitle = resolvePageTitle(
    pathname,
    ITEMS,
    SUB_ROUTE_TITLES,
    activeTile
  );

  const profile: SidebarProfileConfig = useMemo(
    () => ({
      icon: (
        <div className="size-7 rounded-full bg-sidebar-accent flex-shrink-0" />
      ),
      label: 'John Doe',
      subtitle: 'john@automatize.com',
    }),
    []
  );

  const profileMenuItems: SidebarProfileMenuItem[] = useMemo(
    () => [
      {
        icon: <UserCog className="size-4" />,
        label: 'Profile',
        onTap: () => navigate('/profile'),
      },
      {
        icon: <Settings className="size-4" />,
        label: 'Settings',
        onTap: () => navigate('/settings'),
      },
      {
        icon: <LogOut className="size-4" />,
        label: 'Log out',
        variant: 'destructive' as const,
        separator: true,
        onTap: () => {
          // TODO: integrate with auth signOut
        },
      },
    ],
    [navigate]
  );

  const activeIndex = ITEMS.findIndex((item) => item.id === activeTile);

  const navProps: SidebarProps = useMemo(
    () => ({
      items: ITEMS.map((item) => ({
        icon: item.icon,
        label: item.label,
        group: item.group,
        onTap: () =>
          navigate(resolveNavigationTarget(item, lastVisitedRef.current)),
      })),
      activeIndex,
      profile,
      profileMenuItems,
    }),
    [activeIndex, profile, profileMenuItems, navigate]
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <HomeScreen
      navProps={navProps}
      initialProfileData={{
        name: userProfile?.display_name ?? '',
        email: user?.email ?? '',
        companyName: currentTenant?.name ?? '',
        phones: [],
      }}
      pageHeaderProps={{
        title: pageTitle,
        locale: { code: i18n.language, label: i18n.language },
        dateRangePickerProps: {
          placeholder: t('calendar.placeholder'),
          clearLabel: t('calendar.clear'),
          applyLabel: t('calendar.apply'),
        },
        searchBarProps: {
          placeholder: t('search.placeholder'),
          emptyMessage: t('search.no-results'),
        },
      }}
    >
      {children}
    </HomeScreen>
  );
}

/* ─── Layout shell — wraps inner content in Suspense (required by useSearchParams) ── */

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element | null {
  return (
    <Suspense>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  );
}

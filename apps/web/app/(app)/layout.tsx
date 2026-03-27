'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserAuthentication } from '@automatize/supabase-auth';
import { useNavigation } from '@automatize/navigation';
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

const ROUTE_TO_ID: Record<string, string> = Object.fromEntries(
  ITEMS.map((item) => [item.route, item.id])
);

/* ─── Layout ───────────────────────────────────────────────────────────────── */

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserAuthentication();
  const { navigate } = useNavigation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { t, i18n } = useTranslation();
  const activeTile = ROUTE_TO_ID[pathname] ?? 'dashboard';
  const activeItem = ITEMS.find((item) => item.id === activeTile);
  const pageTitle = activeItem?.label ?? 'Dashboard';

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
        onTap: () => router.push('/profile'),
      },
      {
        icon: <Settings className="size-4" />,
        label: 'Settings',
        onTap: () => router.push('/settings'),
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
    [router]
  );

  const activeIndex = ITEMS.findIndex((item) => item.id === activeTile);

  const navProps: SidebarProps = useMemo(
    () => ({
      items: ITEMS.map((item) => ({
        icon: item.icon,
        label: item.label,
        group: item.group,
        onTap: () => router.push(item.route),
      })),
      activeIndex: activeIndex >= 0 ? activeIndex : 0,
      profile,
      profileMenuItems,
    }),
    [activeIndex, profile, profileMenuItems, router]
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <HomeScreen
      navProps={navProps}
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

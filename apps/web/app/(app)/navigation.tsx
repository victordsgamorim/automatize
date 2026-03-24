'use client';

import { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarLayout, useSidebar } from '@automatize/ui/web';
import type {
  SidebarNavItem,
  SidebarProfileConfig,
  SidebarProfileMenuItem,
} from '@automatize/ui/web';
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Settings,
  LogOut,
  UserCog,
} from 'lucide-react';

/* ─── Logo ─────────────────────────────────────────────────────────────────── */

function Logo() {
  const { open, isMobile } = useSidebar();
  const isExpanded = open || isMobile;

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="flex-shrink-0 size-8 rounded-lg bg-primary" />
      {isExpanded && (
        <span className="font-semibold text-sm whitespace-nowrap">
          Automatize
        </span>
      )}
    </div>
  );
}

/* ─── Route → index mapping ────────────────────────────────────────────────── */

const ROUTE_INDEX_MAP: Record<string, number> = {
  '/': 0,
  '/invoices': 1,
  '/products': 2,
  '/clients': 3,
};

/* ─── Navigation ───────────────────────────────────────────────────────────── */

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const activeIndex = ROUTE_INDEX_MAP[pathname] ?? 0;

  const items: SidebarNavItem[] = useMemo(
    () => [
      {
        icon: <LayoutDashboard className="size-5" />,
        label: 'Dashboard',
        group: 'Menu',
        onTap: () => router.push('/'),
      },
      {
        icon: <FileText className="size-5" />,
        label: 'Invoices',
        group: 'Menu',
        onTap: () => router.push('/invoices'),
      },
      {
        icon: <Package className="size-5" />,
        label: 'Products',
        group: 'Menu',
        onTap: () => router.push('/products'),
      },
      {
        icon: <Users className="size-5" />,
        label: 'Clients',
        group: 'Menu',
        onTap: () => router.push('/clients'),
      },
    ],
    [router]
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

  return (
    <SidebarLayout
      header={<Logo />}
      items={items}
      activeIndex={activeIndex}
      profile={profile}
      profileMenuItems={profileMenuItems}
    />
  );
}

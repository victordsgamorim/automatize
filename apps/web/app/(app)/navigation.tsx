'use client';

import { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type {
  SidebarProfileConfig,
  SidebarProfileMenuItem,
} from '@automatize/ui/web';
import type { ContentNavigationItem } from '@automatize/content/web';
import {
  ContentNavigation,
  SidebarLogo,
  TILE_ORDER,
  TILE_ROUTES,
  TILE_LABELS,
  TILE_GROUP,
} from '@automatize/content/web';
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Settings,
  LogOut,
  UserCog,
} from 'lucide-react';
import type { TileId } from '@automatize/content/web';

/* ─── Tile icons (platform-specific, provided by app) ─────────────────────── */

const TILE_ICONS: Record<TileId, React.ReactNode> = {
  dashboard: <LayoutDashboard className="size-5" />,
  invoices: <FileText className="size-5" />,
  products: <Package className="size-5" />,
  clients: <Users className="size-5" />,
};

/* ─── Route → TileId mapping ──────────────────────────────────────────────── */

const ROUTE_TO_TILE: Record<string, TileId> = Object.fromEntries(
  TILE_ORDER.map((id) => [TILE_ROUTES[id], id])
) as Record<string, TileId>;

/* ─── Navigation ───────────────────────────────────────────────────────────── */

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const activeTile: TileId = ROUTE_TO_TILE[pathname] ?? 'dashboard';

  const items: ContentNavigationItem[] = useMemo(
    () =>
      TILE_ORDER.map((tileId) => ({
        id: tileId,
        icon: TILE_ICONS[tileId],
        label: TILE_LABELS[tileId],
        route: TILE_ROUTES[tileId],
        group: TILE_GROUP,
      })),
    []
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
    <ContentNavigation
      onNavigate={(_id, route) => router.push(route)}
      activeTile={activeTile}
      items={items}
      header={<SidebarLogo />}
      profile={profile}
      profileMenuItems={profileMenuItems}
    />
  );
}

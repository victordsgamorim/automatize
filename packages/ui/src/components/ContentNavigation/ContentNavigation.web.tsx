'use client';

import { useMemo } from 'react';
import type {
  SidebarNavItem,
  SidebarProfileConfig,
  SidebarProfileMenuItem,
} from '../Sidebar/Sidebar.web';
import { SidebarLayout, useSidebar } from '../Sidebar/Sidebar.web';

/* ─── Types ────────────────────────────────────────────────────────────────── */

export interface ContentNavigationItem {
  /** Unique identifier for this tile. */
  id: string;
  /** Icon element to display. */
  icon: React.ReactNode;
  /** Display label. */
  label: string;
  /** Route path associated with this tile. */
  route: string;
  /** Optional group label for sidebar grouping. */
  group?: string;
}

export interface ContentNavigationProps {
  /** Called when a tile is clicked. Receives the item id and its route path. */
  onNavigate: (id: string, route: string) => void;
  /** The currently active tile id. */
  activeTile: string;
  /** Ordered list of navigation items (tiles). */
  items: ContentNavigationItem[];
  /** Header slot — typically a logo or brand element. */
  header: React.ReactNode;
  /** Profile configuration for the sidebar footer. */
  profile?: SidebarProfileConfig;
  /** Profile dropdown menu items (Settings, Log out, etc.). */
  profileMenuItems?: SidebarProfileMenuItem[];
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function ContentNavigation({
  onNavigate,
  activeTile,
  items,
  header,
  profile,
  profileMenuItems,
}: ContentNavigationProps) {
  const activeIndex = items.findIndex((item) => item.id === activeTile);

  const navItems: SidebarNavItem[] = useMemo(
    () =>
      items.map((item) => ({
        icon: item.icon,
        label: item.label,
        group: item.group,
        onTap: () => onNavigate(item.id, item.route),
      })),
    [items, onNavigate]
  );

  return (
    <SidebarLayout
      header={header}
      items={navItems}
      activeIndex={activeIndex >= 0 ? activeIndex : 0}
      profile={profile}
      profileMenuItems={profileMenuItems}
    />
  );
}

/* ─── Logo (reusable sidebar logo) ─────────────────────────────────────────── */

export interface SidebarLogoProps {
  /** Brand name text displayed when sidebar is expanded. */
  brandName?: string;
  className?: string;
}

export function SidebarLogo({ brandName = 'Automatize' }: SidebarLogoProps) {
  const { open, isMobile } = useSidebar();
  const isExpanded = open || isMobile;

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="flex-shrink-0 size-8 rounded-lg bg-primary" />
      {isExpanded && (
        <span className="font-semibold text-sm whitespace-nowrap">
          {brandName}
        </span>
      )}
    </div>
  );
}

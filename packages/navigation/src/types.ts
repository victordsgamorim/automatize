/**
 * @automatize/navigation — Shared types
 *
 * Platform-agnostic type definitions for navigation logic.
 * These types are the public contract consumed by all platforms.
 */

import type React from 'react';

// ---------------------------------------------------------------------------
// Route & params
// ---------------------------------------------------------------------------

/** A route path string (e.g. "/invoices", "/clients/123"). */
export type RoutePath = string;

/** Arbitrary route parameters (query-string on web, search-params on native). */
export type RouteParams = Record<string, string | undefined>;

/** Information about the current route. */
export interface RouteInfo {
  /** Current pathname (e.g. "/invoices"). */
  path: RoutePath;
  /** Parsed route parameters. */
  params: RouteParams;
}

// ---------------------------------------------------------------------------
// Navigation methods
// ---------------------------------------------------------------------------

/** Core navigation actions returned by `useNavigation()`. */
export interface NavigationMethods {
  /** Push a new route onto the stack. */
  navigate: (path: RoutePath) => void;
  /** Go back one entry in the history stack. */
  goBack: () => void;
  /** Whether there is a previous entry to go back to. */
  canGoBack: () => boolean;
  /** Replace the current entry without adding to the stack. */
  replace: (path: RoutePath) => void;
}

// ---------------------------------------------------------------------------
// NavigationLink
// ---------------------------------------------------------------------------

/** Props accepted by the cross-platform NavigationLink component. */
export interface NavigationLinkProps {
  /** Destination route path. */
  href: RoutePath;
  /** Optional flag to replace instead of push. */
  replace?: boolean;
  /** Whether the link should be treated as external (opens browser/system). */
  external?: boolean;
  /** Content to render inside the link. */
  children: React.ReactNode;
  /** Accessible label for screen readers. */
  accessibilityLabel?: string;
  /** Additional CSS class name (web only). */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties | Record<string, unknown>;
  /** Called when the link is pressed/clicked. */
  onPress?: () => void;
}

// ---------------------------------------------------------------------------
// NavigationMenu
// ---------------------------------------------------------------------------

/** A single item inside a NavigationMenu. */
export interface NavigationMenuItem {
  /** Unique key for this item. */
  key: string;
  /** Display label. */
  label: string;
  /** Destination route path. */
  href: RoutePath;
  /** Optional icon element (platform-resolved by consumer). */
  icon?: React.ReactNode;
  /** Optional badge content (e.g. unread count). */
  badge?: string | number;
}

/** A group of menu items with an optional section label. */
export interface NavigationMenuGroup {
  /** Optional section heading. */
  title?: string;
  /** Items in this group. */
  items: NavigationMenuItem[];
}

/** Props accepted by the cross-platform NavigationMenu component. */
export interface NavigationMenuProps {
  /** Flat list of items or grouped sections. */
  items: NavigationMenuItem[] | NavigationMenuGroup[];
  /** Called when user selects an item (in addition to built-in navigation). */
  onItemSelect?: (item: NavigationMenuItem) => void;
  /** Additional CSS class name (web only). */
  className?: string;
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

/** A single segment in a breadcrumb trail. */
export interface BreadcrumbSegment {
  /** Display label for this segment. */
  label: string;
  /** Route path this segment links to (`undefined` for the current page). */
  href?: RoutePath;
}

/** Props accepted by the cross-platform Breadcrumb component. */
export interface BreadcrumbProps {
  /** Ordered list of breadcrumb segments (last is current page). */
  segments: BreadcrumbSegment[];
  /** Custom separator element (defaults to platform convention). */
  separator?: React.ReactNode;
  /** Additional CSS class name (web only). */
  className?: string;
}

// ---------------------------------------------------------------------------
// Navigation state sync
// ---------------------------------------------------------------------------

/** Options for the navigation state synchronisation hook. */
export interface NavigationSyncOptions {
  /** Whether to synchronise the URL with internal navigation state (web). */
  syncUrl?: boolean;
  /** Callback invoked whenever the route changes. */
  onRouteChange?: (route: RouteInfo) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Type-guard: checks whether an array of menu props is grouped.
 */
export function isGroupedMenu(
  items: NavigationMenuItem[] | NavigationMenuGroup[]
): items is NavigationMenuGroup[] {
  return items.length > 0 && 'items' in items[0];
}

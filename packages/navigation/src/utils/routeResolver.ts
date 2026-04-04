/**
 * Route resolution utilities.
 *
 * Pure functions extracted from the app layout so that route-to-menu mapping,
 * active tile detection, page title resolution and "last visited" memory
 * can be tested without rendering any React component.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal definition of a navigation item (platform-agnostic). */
export interface RouteItem {
  /** Unique identifier for this item (e.g. "clients"). */
  id: string;
  /** Human-readable label shown in the sidebar / header. */
  label: string;
  /** Base route path (e.g. "/clients"). */
  route: string;
}

// ---------------------------------------------------------------------------
// Route ↔ ID mapping
// ---------------------------------------------------------------------------

/**
 * Build a record that maps exact route strings to their item IDs.
 *
 * @example
 * buildRouteToIdMap(items)
 * // => { "/": "dashboard", "/invoices": "invoices", "/clients": "clients" }
 */
export function buildRouteToIdMap(
  items: readonly RouteItem[]
): Record<string, string> {
  return Object.fromEntries(items.map((item) => [item.route, item.id]));
}

// ---------------------------------------------------------------------------
// Active tile resolution
// ---------------------------------------------------------------------------

/**
 * Determine which navigation item is active for a given pathname.
 *
 * Resolution order:
 * 1. Exact match via `routeToId` lookup.
 * 2. Prefix match — the first item whose `route` (excluding "/") is a prefix
 *    of `pathname`.
 * 3. `undefined` if nothing matches.
 */
export function resolveActiveTile(
  pathname: string,
  items: readonly RouteItem[],
  routeToId: Record<string, string>
): string | undefined {
  // 1. Exact match
  const exact = routeToId[pathname];
  if (exact) return exact;

  // 2. Prefix match (skip root "/" to avoid matching everything)
  const prefixed = items.find(
    (item) => item.route !== '/' && pathname.startsWith(item.route)
  );
  return prefixed?.id;
}

// ---------------------------------------------------------------------------
// Page title resolution
// ---------------------------------------------------------------------------

/**
 * Resolve the page header title for a given pathname.
 *
 * Priority:
 * 1. Explicit sub-route title (e.g. "/clients/new" → "New Client").
 * 2. Active navigation item label.
 * 3. Fallback string (defaults to "Dashboard").
 */
export function resolvePageTitle(
  pathname: string,
  items: readonly RouteItem[],
  subRouteTitles: Record<string, string>,
  activeTileId: string | undefined,
  fallback = 'Dashboard'
): string {
  const subTitle = subRouteTitles[pathname];
  if (subTitle) return subTitle;

  if (activeTileId) {
    const item = items.find((i) => i.id === activeTileId);
    if (item) return item.label;
  }

  return fallback;
}

// ---------------------------------------------------------------------------
// Last-visited memory
// ---------------------------------------------------------------------------

/**
 * Return the route that should be navigated to when a sidebar item is tapped.
 *
 * If the user previously visited a sub-route for this item (e.g. `/clients/new`),
 * that path is returned; otherwise the item's base route is used.
 */
export function resolveNavigationTarget(
  item: RouteItem,
  lastVisited: Record<string, string>
): string {
  return lastVisited[item.id] ?? item.route;
}

/**
 * Record the current pathname as the last visited path for the active tile.
 *
 * Returns a **new** record (immutable) so callers can decide whether to
 * mutate a ref or set state.
 */
export function recordLastVisited(
  activeTileId: string | undefined,
  pathname: string,
  current: Record<string, string>
): Record<string, string> {
  if (!activeTileId) return current;
  return { ...current, [activeTileId]: pathname };
}

/**
 * @automatize/navigation — Web entry point
 *
 * Resolved automatically by bundlers (webpack / Next.js) via the
 * `default` condition in package.json exports.
 */

// Types (re-exported for convenience — also available via ./types)
export type {
  RoutePath,
  RouteParams,
  RouteInfo,
  NavigationMethods,
  NavigationLinkProps,
  NavigationMenuItem,
  NavigationMenuGroup,
  NavigationMenuProps,
  BreadcrumbSegment,
  BreadcrumbProps,
  NavigationSyncOptions,
} from './types';

export { isGroupedMenu } from './types';

// Hooks
export { useNavigation } from './hooks/useNavigation.web';
export { useRoute } from './hooks/useRoute.web';
export { useFocusEffect } from './hooks/useFocusEffect.web';
export { useNavigationSync } from './hooks/useNavigationSync.web';

// Components
export { NavigationLink } from './components/NavigationLink.web';
export { NavigationMenu } from './components/NavigationMenu.web';
export { Breadcrumb } from './components/Breadcrumb.web';

// Utils
export {
  buildRouteToIdMap,
  resolveActiveTile,
  resolvePageTitle,
  resolveNavigationTarget,
  recordLastVisited,
} from './utils/routeResolver';
export type { RouteItem } from './utils/routeResolver';

/**
 * @automatize/navigation — Native entry point (Expo / React Native)
 *
 * Resolved automatically by Metro via the `react-native` condition
 * in package.json exports.
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
export { useNavigation } from './hooks/useNavigation.native';
export { useRoute } from './hooks/useRoute.native';
export { useFocusEffect } from './hooks/useFocusEffect.native';
export { useNavigationSync } from './hooks/useNavigationSync.native';

// Components
export { NavigationLink } from './components/NavigationLink.native';
export { NavigationMenu } from './components/NavigationMenu.native';
export { Breadcrumb } from './components/Breadcrumb.native';

// Utils
export {
  buildRouteToIdMap,
  resolveActiveTile,
  resolvePageTitle,
  resolveNavigationTarget,
  recordLastVisited,
} from './utils/routeResolver';
export type { RouteItem } from './utils/routeResolver';

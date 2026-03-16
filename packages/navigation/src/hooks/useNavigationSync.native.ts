import { useEffect, useRef } from 'react';
import { usePathname, useLocalSearchParams } from 'expo-router';
import type { NavigationSyncOptions, RouteInfo, RouteParams } from '../types';

/**
 * Native implementation of `useNavigationSync`.
 *
 * Listens for route changes via Expo Router hooks and invokes
 * `onRouteChange` whenever the pathname or search params change.
 *
 * On native, URL synchronisation (`syncUrl`) is only meaningful for
 * Expo Web — on iOS/Android it is a no-op. The primary value is
 * the `onRouteChange` callback for analytics, breadcrumb state, etc.
 */
export function useNavigationSync(options: NavigationSyncOptions = {}): void {
  const { onRouteChange } = options;
  const path = usePathname();
  const rawParams = useLocalSearchParams();
  const callbackRef = useRef(onRouteChange);
  callbackRef.current = onRouteChange;

  useEffect(() => {
    if (!callbackRef.current) return;

    const params: RouteParams = {};
    for (const [key, value] of Object.entries(rawParams)) {
      params[key] = Array.isArray(value) ? value[0] : value;
    }

    const route: RouteInfo = { path, params };
    callbackRef.current(route);
  }, [path, rawParams]);
}

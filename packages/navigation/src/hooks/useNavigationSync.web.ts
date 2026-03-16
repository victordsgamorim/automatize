'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { NavigationSyncOptions, RouteInfo, RouteParams } from '../types';

/**
 * Web implementation of `useNavigationSync`.
 *
 * Listens for URL changes (via Next.js App Router hooks) and invokes
 * `onRouteChange` whenever the pathname or search params change.
 *
 * On the web, URL synchronisation is handled natively by the browser
 * and Next.js router, so the `syncUrl` option is a no-op (always in
 * sync). The primary value of this hook on web is the `onRouteChange`
 * callback for analytics, breadcrumb generation, etc.
 */
export function useNavigationSync(options: NavigationSyncOptions = {}): void {
  const { onRouteChange } = options;
  const path = usePathname();
  const searchParams = useSearchParams();
  const callbackRef = useRef(onRouteChange);
  callbackRef.current = onRouteChange;

  useEffect(() => {
    if (!callbackRef.current) return;

    const params: RouteParams = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const route: RouteInfo = { path, params };
    callbackRef.current(route);
  }, [path, searchParams]);
}

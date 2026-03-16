'use client';

import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { RouteInfo, RouteParams } from '../types';

/**
 * Web implementation of `useRoute`.
 *
 * Returns the current pathname and parsed query parameters using
 * Next.js App Router primitives.
 */
export function useRoute(): RouteInfo {
  const path = usePathname();
  const searchParams = useSearchParams();

  const params: RouteParams = useMemo(() => {
    const result: RouteParams = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }, [searchParams]);

  return useMemo(() => ({ path, params }), [path, params]);
}

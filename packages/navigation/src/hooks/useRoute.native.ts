import { useMemo } from 'react';
import { usePathname, useLocalSearchParams } from 'expo-router';
import type { RouteInfo, RouteParams } from '../types';

/**
 * Native implementation of `useRoute`.
 *
 * Returns the current pathname and search parameters using
 * Expo Router primitives.
 */
export function useRoute(): RouteInfo {
  const path = usePathname();
  const rawParams = useLocalSearchParams();

  const params: RouteParams = useMemo(() => {
    const result: RouteParams = {};
    for (const [key, value] of Object.entries(rawParams)) {
      // useLocalSearchParams may return string[] for repeated params;
      // we normalise to the first value to match our RouteParams contract.
      result[key] = Array.isArray(value) ? value[0] : value;
    }
    return result;
  }, [rawParams]);

  return useMemo(() => ({ path, params }), [path, params]);
}

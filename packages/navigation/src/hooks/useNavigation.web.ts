'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { NavigationMethods, RoutePath } from '../types';

/**
 * Web implementation of `useNavigation`.
 *
 * Wraps the Next.js App Router to expose a platform-agnostic
 * navigation API identical to the native variant.
 */
export function useNavigation(): NavigationMethods {
  const router = useRouter();

  const navigate = useCallback(
    (path: RoutePath) => {
      router.push(path);
    },
    [router]
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const canGoBack = useCallback(() => {
    // Browsers always have a history stack once the user has navigated.
    // The History API does not expose a reliable "length === 1" check,
    // so we default to `true` — callers should still guard their UX.
    return typeof window !== 'undefined' && window.history.length > 1;
  }, []);

  const replace = useCallback(
    (path: RoutePath) => {
      router.replace(path);
    },
    [router]
  );

  return useMemo(
    () => ({ navigate, goBack, canGoBack, replace }),
    [navigate, goBack, canGoBack, replace]
  );
}

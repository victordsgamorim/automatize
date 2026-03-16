import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import type { NavigationMethods, RoutePath } from '../types';

/**
 * Native implementation of `useNavigation`.
 *
 * Wraps Expo Router to expose a platform-agnostic navigation API
 * identical to the web variant.
 */
export function useNavigation(): NavigationMethods {
  const router = useRouter();

  const navigate = useCallback(
    (path: RoutePath) => {
      // Expo Router's push accepts Href — a string path works.
      router.push(path as never);
    },
    [router]
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const canGoBack = useCallback(() => {
    return router.canGoBack();
  }, [router]);

  const replace = useCallback(
    (path: RoutePath) => {
      router.replace(path as never);
    },
    [router]
  );

  return useMemo(
    () => ({ navigate, goBack, canGoBack, replace }),
    [navigate, goBack, canGoBack, replace]
  );
}

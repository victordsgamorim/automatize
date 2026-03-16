'use client';

import { useEffect, useRef } from 'react';

/**
 * Web implementation of `useFocusEffect`.
 *
 * On the web, a mounted component is considered "focused" for the
 * entire duration it is in the DOM. This mirrors React Navigation's
 * `useFocusEffect` semantics: the callback fires on mount and its
 * cleanup fires on unmount.
 *
 * The callback follows the same contract as React Navigation:
 * it receives no arguments and may return a cleanup function.
 */
export function useFocusEffect(callback: () => void | (() => void)): void {
  // Store latest callback in a ref to avoid re-running the effect
  // when the callback identity changes (same pattern as React Navigation).
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const cleanup = callbackRef.current();
    return cleanup ?? undefined;
  }, []);
}

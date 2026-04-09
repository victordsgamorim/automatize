import { useState, useCallback } from 'react';
import type {
  UseDraftPersistenceOptions,
  UseDraftPersistenceResult,
} from './useDraftPersistence.types';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

/** Returns true if the page was loaded via a browser refresh (F5) */
function isPageReload(): boolean {
  if (!isClient()) return false;
  if (typeof performance === 'undefined') return false;
  const navEntries = performance.getEntriesByType(
    'navigation'
  ) as PerformanceNavigationTiming[];
  return navEntries.length > 0 && navEntries[0].type === 'reload';
}

export function useDraftPersistence<T>(
  options: UseDraftPersistenceOptions
): UseDraftPersistenceResult<T> {
  const { storageKey } = options;

  const loadDraft = useCallback((): T | undefined => {
    if (!isClient()) return undefined;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      /* corrupted data — ignore */
    }
    return undefined;
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    if (!isClient()) return;
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  const [initialData] = useState<T | undefined>(() => {
    if (isPageReload()) {
      clearDraft();
      return undefined;
    }
    return loadDraft();
  });

  const save = useCallback(
    (data: T) => {
      if (!isClient()) return;
      sessionStorage.setItem(storageKey, JSON.stringify(data));
    },
    [storageKey]
  );

  const clear = useCallback(() => {
    clearDraft();
  }, [clearDraft]);

  return {
    initialData,
    save,
    clear,
  };
}

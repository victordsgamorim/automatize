import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useDraftPersistence } from '../useDraftPersistence';

interface TestFormData {
  name: string;
  value: number;
}

const STORAGE_KEY = 'test:draft-persistence';

describe('useDraftPersistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialData', () => {
    it('returns undefined when no draft exists in sessionStorage', () => {
      const { result } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      expect(result.current.initialData).toBeUndefined();
    });

    it('restores draft from sessionStorage when it exists', () => {
      const draft: TestFormData = { name: 'test', value: 42 };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));

      const { result } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      expect(result.current.initialData).toEqual(draft);
    });

    it('returns undefined and ignores corrupted JSON in sessionStorage', () => {
      sessionStorage.setItem(STORAGE_KEY, '{invalid json');

      const { result } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      expect(result.current.initialData).toBeUndefined();
    });

    it('clears draft and returns undefined on page reload (F5)', () => {
      const draft: TestFormData = { name: 'test', value: 42 };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));

      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
        { type: 'reload' } as PerformanceNavigationTiming,
      ]);

      const { result } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      expect(result.current.initialData).toBeUndefined();
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('restores draft on SPA navigation (not a reload)', () => {
      const draft: TestFormData = { name: 'test', value: 42 };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));

      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
        { type: 'navigate' } as PerformanceNavigationTiming,
      ]);

      const { result } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      expect(result.current.initialData).toEqual(draft);
    });
  });

  describe('save', () => {
    it('persists data to sessionStorage', () => {
      const { result } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      const data: TestFormData = { name: 'hello', value: 123 };

      act(() => {
        result.current.save(data);
      });

      const stored = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY) ?? '{}'
      ) as TestFormData;
      expect(stored).toEqual(data);
    });

    it('overwrites existing draft in sessionStorage', () => {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: 'old', value: 0 })
      );

      const { result } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      act(() => {
        result.current.save({ name: 'new', value: 99 });
      });

      const stored = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY) ?? '{}'
      ) as TestFormData;
      expect(stored).toEqual({ name: 'new', value: 99 });
    });
  });

  describe('clear', () => {
    it('removes draft from sessionStorage', () => {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: 'test', value: 1 })
      );

      const { result } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      act(() => {
        result.current.clear();
      });

      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('does nothing when no draft exists', () => {
      const { result } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      act(() => {
        result.current.clear();
      });

      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('full lifecycle', () => {
    it('save -> navigate away -> return restores draft', () => {
      const { result } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      act(() => {
        result.current.save({ name: 'persisted', value: 7 });
      });

      expect(sessionStorage.getItem(STORAGE_KEY)).toBeTruthy();

      // Simulate navigating back: new hook instance
      const { result: restored } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      expect(restored.current.initialData).toEqual({
        name: 'persisted',
        value: 7,
      });
    });

    it('save -> clear -> return yields no draft', () => {
      const { result } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      act(() => {
        result.current.save({ name: 'temp', value: 1 });
      });
      act(() => {
        result.current.clear();
      });

      const { result: afterClear } = renderHook(() =>
        useDraftPersistence<TestFormData>({ storageKey: STORAGE_KEY })
      );

      expect(afterClear.current.initialData).toBeUndefined();
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusEffect } from '../../hooks/useFocusEffect.web';

describe('useFocusEffect (web)', () => {
  it('calls the callback on mount', () => {
    const callback = vi.fn();
    renderHook(() => useFocusEffect(callback));
    expect(callback).toHaveBeenCalledOnce();
  });

  it('calls the cleanup function on unmount', () => {
    const cleanup = vi.fn();
    const callback = vi.fn(() => cleanup);

    const { unmount } = renderHook(() => useFocusEffect(callback));
    expect(callback).toHaveBeenCalledOnce();
    expect(cleanup).not.toHaveBeenCalled();

    unmount();
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('does not re-run the callback when identity changes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(({ cb }) => useFocusEffect(cb), {
      initialProps: { cb: callback1 },
    });

    expect(callback1).toHaveBeenCalledOnce();

    rerender({ cb: callback2 });
    // The web variant uses useRef to store the latest callback —
    // the useEffect itself doesn't re-run.
    expect(callback2).not.toHaveBeenCalled();
  });
});

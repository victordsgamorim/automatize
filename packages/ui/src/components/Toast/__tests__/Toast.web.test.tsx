import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { _toastStore, _resetToastStore } from '../Toast.web';

describe('toastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    _resetToastStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── add ──────────────────────────────────────────────────────────────────

  it('adds a toast to the store', () => {
    _toastStore.add('Hello', 'message');
    expect(_toastStore.toasts).toHaveLength(1);
    expect(_toastStore.toasts[0].text).toBe('Hello');
    expect(_toastStore.toasts[0].type).toBe('message');
  });

  it('assigns incrementing unique ids', () => {
    _toastStore.add('First', 'success');
    _toastStore.add('Second', 'error');
    const ids = _toastStore.toasts.map((t) => t.id);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('notifies subscribers when a toast is added', () => {
    const listener = vi.fn();
    _toastStore.subscribe(listener);
    _toastStore.add('Toast', 'warning');
    expect(listener).toHaveBeenCalledOnce();
  });

  // ── auto-dismiss ─────────────────────────────────────────────────────────

  it('auto-dismisses a toast after 3000ms', () => {
    _toastStore.add('Bye', 'success');
    expect(_toastStore.toasts).toHaveLength(1);

    vi.advanceTimersByTime(3000);
    expect(_toastStore.toasts).toHaveLength(0);
  });

  it('does not auto-dismiss when preserve=true', () => {
    _toastStore.add('Sticky', 'message', true);
    vi.advanceTimersByTime(10_000);
    expect(_toastStore.toasts).toHaveLength(1);
  });

  it('notifies subscribers when auto-dismiss fires', () => {
    const listener = vi.fn();
    _toastStore.subscribe(listener);
    listener.mockClear();

    _toastStore.add('Auto', 'success');
    listener.mockClear();

    vi.advanceTimersByTime(3000);
    expect(listener).toHaveBeenCalledOnce();
  });

  // ── remove ────────────────────────────────────────────────────────────────

  it('removes a specific toast by id', () => {
    _toastStore.add('A', 'message');
    _toastStore.add('B', 'error');
    const idA = _toastStore.toasts[0].id;

    _toastStore.remove(idA);

    expect(_toastStore.toasts).toHaveLength(1);
    expect(_toastStore.toasts[0].text).toBe('B');
  });

  it('notifies subscribers when a toast is removed', () => {
    const listener = vi.fn();
    _toastStore.add('Remove me', 'warning');
    const id = _toastStore.toasts[0].id;
    _toastStore.subscribe(listener);

    _toastStore.remove(id);
    expect(listener).toHaveBeenCalledOnce();
  });

  // ── pause / resume ────────────────────────────────────────────────────────

  it('pausing halts the auto-dismiss timer', () => {
    _toastStore.add('Paused', 'message');
    const toast = _toastStore.toasts[0];

    vi.advanceTimersByTime(1000);
    toast.pause?.();

    vi.advanceTimersByTime(5000);
    expect(_toastStore.toasts).toHaveLength(1);
  });

  it('resuming restarts the timer from remaining time', () => {
    _toastStore.add('Resume', 'message');
    const toast = _toastStore.toasts[0];

    // Advance 1 s, pause, advance far, resume — needs 2 more seconds
    vi.advanceTimersByTime(1000);
    toast.pause?.();
    vi.advanceTimersByTime(10_000);
    toast.resume?.();

    vi.advanceTimersByTime(1999);
    expect(_toastStore.toasts).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(_toastStore.toasts).toHaveLength(0);
  });

  // ── subscribe / unsubscribe ───────────────────────────────────────────────

  it('unsubscribing stops notifications', () => {
    const listener = vi.fn();
    const unsubscribe = _toastStore.subscribe(listener);
    unsubscribe();

    _toastStore.add('Silent', 'error');
    expect(listener).not.toHaveBeenCalled();
  });

  it('supports multiple concurrent subscribers', () => {
    const a = vi.fn();
    const b = vi.fn();
    _toastStore.subscribe(a);
    _toastStore.subscribe(b);

    _toastStore.add('Multi', 'success');
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
  });
});

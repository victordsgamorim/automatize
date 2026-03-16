import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the module under test.
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
}));

// Import after mocks are set up.
import { useNavigation } from '../../hooks/useNavigation.web';

describe('useNavigation (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns navigate, goBack, canGoBack, and replace', () => {
    const { result } = renderHook(() => useNavigation());

    expect(result.current).toHaveProperty('navigate');
    expect(result.current).toHaveProperty('goBack');
    expect(result.current).toHaveProperty('canGoBack');
    expect(result.current).toHaveProperty('replace');
    expect(typeof result.current.navigate).toBe('function');
    expect(typeof result.current.goBack).toBe('function');
    expect(typeof result.current.canGoBack).toBe('function');
    expect(typeof result.current.replace).toBe('function');
  });

  it('navigate() calls router.push with the given path', () => {
    const { result } = renderHook(() => useNavigation());
    result.current.navigate('/invoices');
    expect(mockPush).toHaveBeenCalledWith('/invoices');
  });

  it('goBack() calls router.back', () => {
    const { result } = renderHook(() => useNavigation());
    result.current.goBack();
    expect(mockBack).toHaveBeenCalledOnce();
  });

  it('replace() calls router.replace with the given path', () => {
    const { result } = renderHook(() => useNavigation());
    result.current.replace('/clients');
    expect(mockReplace).toHaveBeenCalledWith('/clients');
  });

  it('canGoBack() returns true when history length > 1', () => {
    // jsdom default window.history.length is 1
    Object.defineProperty(window.history, 'length', {
      value: 3,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNavigation());
    expect(result.current.canGoBack()).toBe(true);

    // Restore
    Object.defineProperty(window.history, 'length', {
      value: 1,
      writable: true,
      configurable: true,
    });
  });

  it('canGoBack() returns false when history length <= 1', () => {
    Object.defineProperty(window.history, 'length', {
      value: 1,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useNavigation());
    expect(result.current.canGoBack()).toBe(false);
  });
});

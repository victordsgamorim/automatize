import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockPathname = '/invoices';
const mockSearchParams = new URLSearchParams('status=pending&page=2');

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

import { useRoute } from '../../hooks/useRoute.web';

describe('useRoute (web)', () => {
  beforeEach(() => {
    mockPathname = '/invoices';
    vi.clearAllMocks();
  });

  it('returns the current path', () => {
    const { result } = renderHook(() => useRoute());
    expect(result.current.path).toBe('/invoices');
  });

  it('returns parsed query params', () => {
    const { result } = renderHook(() => useRoute());
    expect(result.current.params).toEqual({
      status: 'pending',
      page: '2',
    });
  });

  it('reflects pathname changes', () => {
    mockPathname = '/clients/123';
    const { result } = renderHook(() => useRoute());
    expect(result.current.path).toBe('/clients/123');
  });
});

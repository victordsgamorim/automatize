import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AuthContext } from './context';
import type { AuthContextValue } from './types';
import { useAuth } from './useAuth';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useContext: vi.fn(),
  };
});

const mockedUseContext = vi.mocked(React.useContext);

const mockAuthValue: AuthContextValue = {
  isLoading: false,
  login: vi.fn(),
};

describe('useAuth', () => {
  it('returns the auth context value when inside a provider', () => {
    mockedUseContext.mockReturnValueOnce(mockAuthValue);

    const result = useAuth();

    expect(result).toBe(mockAuthValue);
    expect(mockedUseContext).toHaveBeenCalledWith(AuthContext);
  });

  it('throws when called outside an AuthProvider (context is null)', () => {
    mockedUseContext.mockReturnValueOnce(null);

    expect(() => useAuth()).toThrow(
      'useAuth must be called inside a component tree wrapped by <AuthProvider>.'
    );
  });

  it('throws with a message that mentions AuthProvider', () => {
    mockedUseContext.mockReturnValueOnce(null);

    expect(() => useAuth()).toThrowError(/AuthProvider/);
  });

  it('exposes isLoading from the context', () => {
    const loadingValue: AuthContextValue = {
      ...mockAuthValue,
      isLoading: true,
    };
    mockedUseContext.mockReturnValueOnce(loadingValue);

    const result = useAuth();

    expect(result.isLoading).toBe(true);
  });

  it('exposes the login function from the context', () => {
    mockedUseContext.mockReturnValueOnce(mockAuthValue);

    const result = useAuth();

    expect(typeof result.login).toBe('function');
  });
});

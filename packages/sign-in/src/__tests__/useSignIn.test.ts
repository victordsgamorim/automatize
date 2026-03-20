import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@automatize/auth';

import { useSignIn } from '../useSignIn';

// Partially mock @automatize/auth: keep loginSchema real, stub useAuth
vi.mock('@automatize/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@automatize/auth')>();
  return { ...actual, useAuth: vi.fn() };
});

const mockLogin = vi.fn();

describe('useSignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({
      login: mockLogin,
      resetPassword: vi.fn(),
      isLoading: false,
    });
  });

  describe('initial state', () => {
    it('starts with empty email and password', () => {
      const { result } = renderHook(() => useSignIn());
      expect(result.current.email).toBe('');
      expect(result.current.password).toBe('');
    });

    it('starts with no error and not loading', () => {
      const { result } = renderHook(() => useSignIn());
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('starts with password hidden', () => {
      const { result } = renderHook(() => useSignIn());
      expect(result.current.showPassword).toBe(false);
    });
  });

  describe('state setters', () => {
    it('setEmail updates email state', () => {
      const { result } = renderHook(() => useSignIn());
      act(() => {
        result.current.setEmail('user@example.com');
      });
      expect(result.current.email).toBe('user@example.com');
    });

    it('setPassword updates password state', () => {
      const { result } = renderHook(() => useSignIn());
      act(() => {
        result.current.setPassword('secret123');
      });
      expect(result.current.password).toBe('secret123');
    });

    it('toggleShowPassword toggles showPassword on/off', () => {
      const { result } = renderHook(() => useSignIn());
      act(() => {
        result.current.toggleShowPassword();
      });
      expect(result.current.showPassword).toBe(true);
      act(() => {
        result.current.toggleShowPassword();
      });
      expect(result.current.showPassword).toBe(false);
    });
  });

  describe('isLoading', () => {
    it('reflects authLoading from useAuth', () => {
      (useAuth as Mock).mockReturnValue({
        login: mockLogin,
        resetPassword: vi.fn(),
        isLoading: true,
      });
      const { result } = renderHook(() => useSignIn());
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('handleSignIn', () => {
    it('returns { success: false } and sets error when email is invalid', async () => {
      const { result } = renderHook(() => useSignIn());
      act(() => {
        result.current.setEmail('not-an-email');
        result.current.setPassword('pass123');
      });

      let outcome: { success: boolean } | undefined;
      await act(async () => {
        outcome = await result.current.handleSignIn();
      });

      expect(outcome?.success).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('returns { success: false } and sets error when password is empty', async () => {
      const { result } = renderHook(() => useSignIn());
      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('');
      });

      let outcome: { success: boolean } | undefined;
      await act(async () => {
        outcome = await result.current.handleSignIn();
      });

      expect(outcome?.success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    it('calls login with valid credentials and returns { success: true }', async () => {
      mockLogin.mockResolvedValue(undefined);
      const { result } = renderHook(() => useSignIn());
      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('password123');
      });

      let outcome: { success: boolean } | undefined;
      await act(async () => {
        outcome = await result.current.handleSignIn();
      });

      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
      expect(outcome?.success).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('normalises email to lowercase before calling login', async () => {
      mockLogin.mockResolvedValue(undefined);
      const { result } = renderHook(() => useSignIn());
      act(() => {
        result.current.setEmail('User@Example.COM');
        result.current.setPassword('password123');
      });

      await act(async () => {
        await result.current.handleSignIn();
      });

      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
    });

    it('sets error and returns { success: false } when login throws', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));
      const { result } = renderHook(() => useSignIn());
      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('wrongpass');
      });

      let outcome: { success: boolean } | undefined;
      await act(async () => {
        outcome = await result.current.handleSignIn();
      });

      expect(outcome?.success).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('clears the previous error before each new attempt', async () => {
      mockLogin
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValue(undefined);

      const { result } = renderHook(() => useSignIn());
      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('password123');
      });

      // First attempt — should fail and set error
      await act(async () => {
        await result.current.handleSignIn();
      });
      expect(result.current.error).toBe('First error');

      // Second attempt — should succeed and clear error
      await act(async () => {
        await result.current.handleSignIn();
      });
      expect(result.current.error).toBeNull();
    });

    it('falls back to generic message when login throws a non-Error', async () => {
      mockLogin.mockRejectedValue('unexpected string rejection');
      const { result } = renderHook(() => useSignIn());
      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('password123');
      });

      await act(async () => {
        await result.current.handleSignIn();
      });

      expect(result.current.error).toBe('Sign in failed');
    });
  });
});

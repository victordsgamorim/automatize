import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@automatize/auth', async () => {
  const actual =
    await vi.importActual<typeof import('@automatize/auth')>(
      '@automatize/auth'
    );
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

import { useAuth } from '@automatize/auth';
import { useForgotPassword } from '../useForgotPassword';

const mockResetPassword = vi.fn();
const mockedUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  vi.clearAllMocks();
  mockResetPassword.mockResolvedValue(undefined);
  mockedUseAuth.mockReturnValue({
    login: vi.fn(),
    resetPassword: mockResetPassword,
    isLoading: false,
  });
});

describe('useForgotPassword', () => {
  describe('initial state', () => {
    it('starts with empty email', () => {
      const { result } = renderHook(() => useForgotPassword());
      expect(result.current.email).toBe('');
    });

    it('starts with no error', () => {
      const { result } = renderHook(() => useForgotPassword());
      expect(result.current.error).toBeNull();
    });

    it('starts not loading', () => {
      const { result } = renderHook(() => useForgotPassword());
      expect(result.current.isLoading).toBe(false);
    });

    it('starts not in success state', () => {
      const { result } = renderHook(() => useForgotPassword());
      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('state setters', () => {
    it('updates email', () => {
      const { result } = renderHook(() => useForgotPassword());
      act(() => result.current.setEmail('user@example.com'));
      expect(result.current.email).toBe('user@example.com');
    });
  });

  describe('isLoading', () => {
    it('reflects auth loading state', () => {
      mockedUseAuth.mockReturnValue({
        login: vi.fn(),
        resetPassword: mockResetPassword,
        isLoading: true,
      });
      const { result } = renderHook(() => useForgotPassword());
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('handleSubmit', () => {
    it('returns error for invalid email', async () => {
      const { result } = renderHook(() => useForgotPassword());
      act(() => result.current.setEmail('not-an-email'));
      let outcome: { success: boolean } = { success: true };
      await act(async () => {
        outcome = await result.current.handleSubmit();
      });
      expect(outcome.success).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('returns error for empty email', async () => {
      const { result } = renderHook(() => useForgotPassword());
      let outcome: { success: boolean } = { success: true };
      await act(async () => {
        outcome = await result.current.handleSubmit();
      });
      expect(outcome.success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    it('calls resetPassword with valid email and sets success', async () => {
      const { result } = renderHook(() => useForgotPassword());
      act(() => result.current.setEmail('user@example.com'));
      let outcome: { success: boolean } = { success: false };
      await act(async () => {
        outcome = await result.current.handleSubmit();
      });
      expect(outcome.success).toBe(true);
      expect(result.current.isSuccess).toBe(true);
      expect(mockResetPassword).toHaveBeenCalledWith('user@example.com');
    });

    it('normalizes email to lowercase', async () => {
      const { result } = renderHook(() => useForgotPassword());
      act(() => result.current.setEmail('User@Example.COM'));
      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(mockResetPassword).toHaveBeenCalledWith('user@example.com');
    });

    it('sets error when resetPassword throws', async () => {
      mockResetPassword.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useForgotPassword());
      act(() => result.current.setEmail('user@example.com'));
      let outcome: { success: boolean } = { success: true };
      await act(async () => {
        outcome = await result.current.handleSubmit();
      });
      expect(outcome.success).toBe(false);
      expect(result.current.error).toBe('Network error');
      expect(result.current.isSuccess).toBe(false);
    });

    it('clears previous error on new attempt', async () => {
      mockResetPassword.mockRejectedValueOnce(new Error('First error'));
      const { result } = renderHook(() => useForgotPassword());
      act(() => result.current.setEmail('user@example.com'));
      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(result.current.error).toBe('First error');

      mockResetPassword.mockResolvedValueOnce(undefined);
      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(result.current.error).toBeNull();
      expect(result.current.isSuccess).toBe(true);
    });

    it('falls back to generic message for non-Error throws', async () => {
      mockResetPassword.mockRejectedValue('string error');
      const { result } = renderHook(() => useForgotPassword());
      act(() => result.current.setEmail('user@example.com'));
      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(result.current.error).toBe('Failed to send reset email');
    });
  });
});

// @vitest-environment jsdom
/**
 * Unit tests — useAuthRepository hook
 *
 * Uses @testing-library/react `renderHook` + `act` to exercise the hook
 * against a fully stubbed `AuthRepository`.  No real Supabase connection.
 *
 * Tests cover:
 * - Initial state (isLoading=true until INITIAL_SESSION fires)
 * - INITIAL_SESSION with authenticated user
 * - INITIAL_SESSION with no user (unauthenticated)
 * - signIn: success → user set, failure → failure set
 * - signUp: success, pending_confirmation, failure
 * - signOut: clears user regardless of result kind
 * - refreshUser: authenticated, unauthenticated, failure
 * - clearFailure: resets failure to null
 * - Auth state change events: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthRepository } from './useAuthRepository';
import type {
  AuthRepository,
  AuthStateChangeCallback,
  AuthStateSubscription,
} from '../data/auth.repository';
import type { SupabaseUser } from '../data/user.model';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function buildUser(overrides?: Partial<SupabaseUser>): SupabaseUser {
  return Object.freeze({
    id: 'user-001',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'alice@example.com',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    phone: null,
    phone_confirmed_at: null,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { display_name: 'Alice' },
    identities: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
    last_sign_in_at: null,
    is_anonymous: false,
    confirmation_sent_at: null,
    recovery_sent_at: null,
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Stub repository builder
// ---------------------------------------------------------------------------

/**
 * Creates a stub `AuthRepository` and exposes a helper to simulate auth
 * state change events from outside.
 */
function buildRepository(overrides?: Partial<AuthRepository>): {
  repo: AuthRepository;
  fireAuthEvent: (payload: Parameters<AuthStateChangeCallback>[0]) => void;
} {
  let capturedCallback: AuthStateChangeCallback | null = null;

  const unsubscribeFn = vi.fn();

  const defaultRepo: AuthRepository = {
    signUp: vi.fn().mockResolvedValue({
      kind: 'failure',
      code: 'unknown',
      message: 'not configured',
    }),
    signIn: vi.fn().mockResolvedValue({
      kind: 'failure',
      code: 'unknown',
      message: 'not configured',
    }),
    signOut: vi.fn().mockResolvedValue({ kind: 'success' }),
    getCurrentUser: vi.fn().mockResolvedValue({ kind: 'unauthenticated' }),
    onAuthStateChange: vi
      .fn()
      .mockImplementation(
        (cb: AuthStateChangeCallback): AuthStateSubscription => {
          capturedCallback = cb;
          return { unsubscribe: unsubscribeFn };
        }
      ),
    ...overrides,
  };

  function fireAuthEvent(
    payload: Parameters<AuthStateChangeCallback>[0]
  ): void {
    if (!capturedCallback)
      throw new Error('onAuthStateChange callback was not registered');
    void capturedCallback(payload);
  }

  return { repo: defaultRepo, fireAuthEvent };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const initialSession = (user: SupabaseUser | null) => ({
  event: 'INITIAL_SESSION' as const,
  user,
  accessToken: user ? 'tok' : null,
  refreshToken: user ? 'ref' : null,
  expiresIn: user ? 3600 : null,
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('useAuthRepository — initial state', () => {
  it('starts with isLoading=true before INITIAL_SESSION fires', () => {
    const { repo } = buildRepository();
    const { result } = renderHook(() => useAuthRepository(repo));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.failure).toBeNull();
  });

  it('sets user and isLoading=false when INITIAL_SESSION fires with a user', async () => {
    const user = buildUser();
    const { repo, fireAuthEvent } = buildRepository();
    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      fireAuthEvent(initialSession(user));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user?.id).toBe('user-001');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.failure).toBeNull();
  });

  it('sets user=null and isLoading=false when INITIAL_SESSION fires with null', async () => {
    const { repo, fireAuthEvent } = buildRepository();
    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      fireAuthEvent(initialSession(null));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('unsubscribes from auth state changes on unmount', async () => {
    const unsubscribeFn = vi.fn();
    const { repo } = buildRepository({
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ unsubscribe: unsubscribeFn }),
    });

    const { unmount } = renderHook(() => useAuthRepository(repo));
    unmount();

    expect(unsubscribeFn).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// signIn
// ---------------------------------------------------------------------------

describe('useAuthRepository — signIn', () => {
  it('sets user on success', async () => {
    const user = buildUser();
    const { repo } = buildRepository({
      signIn: vi.fn().mockResolvedValue({
        kind: 'success',
        user,
        accessToken: 'tok',
        refreshToken: 'ref',
        expiresIn: 3600,
      }),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      await result.current.signIn('alice@example.com', 'Password1!');
    });

    expect(result.current.user?.id).toBe('user-001');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.failure).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('sets failure on invalid credentials', async () => {
    const { repo } = buildRepository({
      signIn: vi.fn().mockResolvedValue({
        kind: 'failure',
        code: 'invalid_credentials',
        message: 'Invalid email or password',
      }),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      await result.current.signIn('alice@example.com', 'wrong');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.failure?.code).toBe('invalid_credentials');
    expect(result.current.failure?.message).toBe('Invalid email or password');
    expect(result.current.isLoading).toBe(false);
  });

  it('returns the raw SignInResult', async () => {
    const user = buildUser();
    const { repo } = buildRepository({
      signIn: vi.fn().mockResolvedValue({
        kind: 'success',
        user,
        accessToken: 'tok',
        refreshToken: 'ref',
        expiresIn: 3600,
      }),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    let returnValue:
      | Awaited<ReturnType<typeof result.current.signIn>>
      | undefined;
    await act(async () => {
      returnValue = await result.current.signIn(
        'alice@example.com',
        'Password1!'
      );
    });

    expect(returnValue?.kind).toBe('success');
  });

  it('clears a previous failure at the start of a new signIn', async () => {
    const signInMock = vi
      .fn()
      .mockResolvedValueOnce({
        kind: 'failure',
        code: 'invalid_credentials',
        message: 'Bad',
      })
      .mockResolvedValueOnce({
        kind: 'success',
        user: buildUser(),
        accessToken: 'tok',
        refreshToken: 'ref',
        expiresIn: 3600,
      });

    const { repo } = buildRepository({ signIn: signInMock });
    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      await result.current.signIn('a@b.com', 'bad');
    });
    expect(result.current.failure).not.toBeNull();

    await act(async () => {
      await result.current.signIn('a@b.com', 'good');
    });
    expect(result.current.failure).toBeNull();
  });

  it('sets isLoading=false even when signIn throws', async () => {
    const { repo } = buildRepository({
      signIn: vi.fn().mockRejectedValue(new Error('unexpected')),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      try {
        await result.current.signIn('a@b.com', 'pw');
      } catch {
        /* expected */
      }
    });

    expect(result.current.isLoading).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// signUp
// ---------------------------------------------------------------------------

describe('useAuthRepository — signUp', () => {
  it('sets user when signUp returns success', async () => {
    const user = buildUser();
    const { repo } = buildRepository({
      signUp: vi.fn().mockResolvedValue({
        kind: 'success',
        user,
        accessToken: 'tok',
        refreshToken: 'ref',
        expiresIn: 3600,
      }),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      await result.current.signUp('alice@example.com', 'Password1!');
    });

    expect(result.current.user?.id).toBe('user-001');
    expect(result.current.failure).toBeNull();
  });

  it('leaves user null on pending_confirmation', async () => {
    const user = buildUser({ email_confirmed_at: null });
    const { repo } = buildRepository({
      signUp: vi.fn().mockResolvedValue({ kind: 'pending_confirmation', user }),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    let returnValue:
      | Awaited<ReturnType<typeof result.current.signUp>>
      | undefined;
    await act(async () => {
      returnValue = await result.current.signUp(
        'alice@example.com',
        'Password1!'
      );
    });

    expect(result.current.user).toBeNull();
    expect(returnValue?.kind).toBe('pending_confirmation');
    expect(result.current.failure).toBeNull();
  });

  it('sets failure on signUp error', async () => {
    const { repo } = buildRepository({
      signUp: vi.fn().mockResolvedValue({
        kind: 'failure',
        code: 'user_already_exists',
        message: 'Email already registered',
      }),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      await result.current.signUp('existing@example.com', 'Password1!');
    });

    expect(result.current.failure?.code).toBe('user_already_exists');
    expect(result.current.user).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// signOut
// ---------------------------------------------------------------------------

describe('useAuthRepository — signOut', () => {
  it('clears user on successful signOut', async () => {
    const user = buildUser();
    const { repo, fireAuthEvent } = buildRepository({
      signOut: vi.fn().mockResolvedValue({ kind: 'success' }),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    // Seed a user first
    await act(async () => {
      fireAuthEvent(initialSession(user));
    });
    expect(result.current.user).not.toBeNull();

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('clears user even when signOut returns failure', async () => {
    const user = buildUser();
    const { repo, fireAuthEvent } = buildRepository({
      signOut: vi.fn().mockResolvedValue({
        kind: 'failure',
        code: 'session_expired',
        message: 'Session not found',
      }),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      fireAuthEvent(initialSession(user));
    });
    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.failure?.code).toBe('session_expired');
  });

  it('passes scope to the repository', async () => {
    const signOutMock = vi.fn().mockResolvedValue({ kind: 'success' });
    const { repo } = buildRepository({ signOut: signOutMock });

    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      await result.current.signOut('global');
    });

    expect(signOutMock).toHaveBeenCalledWith('global');
  });
});

// ---------------------------------------------------------------------------
// refreshUser
// ---------------------------------------------------------------------------

describe('useAuthRepository — refreshUser', () => {
  it('sets user when getCurrentUser returns authenticated', async () => {
    const user = buildUser();
    const { repo } = buildRepository({
      getCurrentUser: vi
        .fn()
        .mockResolvedValue({ kind: 'authenticated', user }),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user?.id).toBe('user-001');
    expect(result.current.failure).toBeNull();
  });

  it('clears user when getCurrentUser returns unauthenticated', async () => {
    const user = buildUser();
    const { repo, fireAuthEvent } = buildRepository({
      getCurrentUser: vi.fn().mockResolvedValue({ kind: 'unauthenticated' }),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      fireAuthEvent(initialSession(user));
    });
    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.failure).toBeNull();
  });

  it('sets failure when getCurrentUser returns failure', async () => {
    const { repo } = buildRepository({
      getCurrentUser: vi.fn().mockResolvedValue({
        kind: 'failure',
        code: 'network_error',
        message: 'Network unavailable',
      }),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.failure?.code).toBe('network_error');
    expect(result.current.user).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// clearFailure
// ---------------------------------------------------------------------------

describe('useAuthRepository — clearFailure', () => {
  it('resets failure to null', async () => {
    const { repo } = buildRepository({
      signIn: vi.fn().mockResolvedValue({
        kind: 'failure',
        code: 'invalid_credentials',
        message: 'Bad',
      }),
    });

    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      await result.current.signIn('a@b.com', 'bad');
    });
    expect(result.current.failure).not.toBeNull();

    act(() => {
      result.current.clearFailure();
    });
    expect(result.current.failure).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Auth state change events
// ---------------------------------------------------------------------------

describe('useAuthRepository — auth state changes', () => {
  beforeEach(() => {});

  it('updates user on SIGNED_IN event', async () => {
    const user = buildUser();
    const { repo, fireAuthEvent } = buildRepository();
    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      fireAuthEvent({
        event: 'SIGNED_IN',
        user,
        accessToken: 'tok',
        refreshToken: 'ref',
        expiresIn: 3600,
      });
    });

    expect(result.current.user?.id).toBe('user-001');
  });

  it('clears user on SIGNED_OUT event', async () => {
    const user = buildUser();
    const { repo, fireAuthEvent } = buildRepository();
    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      fireAuthEvent(initialSession(user));
    });
    await act(async () => {
      fireAuthEvent({
        event: 'SIGNED_OUT',
        user: null,
        accessToken: null,
        refreshToken: null,
        expiresIn: null,
      });
    });

    expect(result.current.user).toBeNull();
  });

  it('updates user on TOKEN_REFRESHED event', async () => {
    const user = buildUser();
    const updatedUser = buildUser({ email: 'updated@example.com' });
    const { repo, fireAuthEvent } = buildRepository();
    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      fireAuthEvent(initialSession(user));
    });
    await act(async () => {
      fireAuthEvent({
        event: 'TOKEN_REFRESHED',
        user: updatedUser,
        accessToken: 'new-tok',
        refreshToken: 'new-ref',
        expiresIn: 3600,
      });
    });

    expect(result.current.user?.email).toBe('updated@example.com');
  });

  it('updates user on USER_UPDATED event', async () => {
    const user = buildUser();
    const updatedUser = buildUser({ email: 'new@example.com' });
    const { repo, fireAuthEvent } = buildRepository();
    const { result } = renderHook(() => useAuthRepository(repo));

    await act(async () => {
      fireAuthEvent(initialSession(user));
    });
    await act(async () => {
      fireAuthEvent({
        event: 'USER_UPDATED',
        user: updatedUser,
        accessToken: 'tok',
        refreshToken: 'ref',
        expiresIn: 3600,
      });
    });

    expect(result.current.user?.email).toBe('new@example.com');
  });
});

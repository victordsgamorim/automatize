/**
 * Unit tests — SupabaseAuthRemoteDataSource
 *
 * All tests use a fully stubbed Supabase client — no real network calls.
 * Tests cover:
 * - signUp: success, pending_confirmation, failure
 * - signIn: success, failure (invalid credentials, network)
 * - signOut: success, failure
 * - getCurrentUser: authenticated, unauthenticated, failure
 * - onAuthStateChange: callback invocation, unsubscribe
 */

import { describe, it, expect, vi } from 'vitest';
import { SupabaseAuthRemoteDataSource } from './supabase-auth.datasource';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
import type { AuthStateChangePayload } from './auth.repository';

// ---------------------------------------------------------------------------
// Stub helpers
// ---------------------------------------------------------------------------

/** Minimal Supabase user shape */
function buildRawUser(overrides?: Record<string, unknown>) {
  return {
    id: 'user-123',
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
    updated_at: '2024-06-01T00:00:00Z',
    last_sign_in_at: '2024-06-15T12:00:00Z',
    is_anonymous: false,
    confirmation_sent_at: null,
    recovery_sent_at: null,
    ...overrides,
  };
}

/** Minimal Supabase session shape */
function buildRawSession(user = buildRawUser()) {
  return {
    access_token: 'access-tok-xyz',
    refresh_token: 'refresh-tok-xyz',
    expires_in: 3600,
    token_type: 'bearer',
    user,
  };
}

/** Creates a typed stub SupabaseClient with overridable auth methods */
function buildClient(
  authOverrides: Partial<{
    signUp: unknown;
    signInWithPassword: unknown;
    signOut: unknown;
    getUser: unknown;
    onAuthStateChange: unknown;
  }> = {}
) {
  return {
    auth: {
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      ...authOverrides,
    },
  } as unknown as SupabaseClient<Database>;
}

// ---------------------------------------------------------------------------
// signUp
// ---------------------------------------------------------------------------

describe('SupabaseAuthRemoteDataSource.signUp', () => {
  it('returns success when session is returned immediately', async () => {
    const user = buildRawUser();
    const session = buildRawSession(user);
    const client = buildClient({
      signUp: vi.fn().mockResolvedValue({
        data: { user, session },
        error: null,
      }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signUp('alice@example.com', 'Password1!');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.user.id).toBe('user-123');
      expect(result.user.email).toBe('alice@example.com');
      expect(result.accessToken).toBe('access-tok-xyz');
      expect(result.refreshToken).toBe('refresh-tok-xyz');
      expect(result.expiresIn).toBe(3600);
    }
  });

  it('returns pending_confirmation when no session is returned (email confirmation required)', async () => {
    const user = buildRawUser({ email_confirmed_at: null });
    const client = buildClient({
      signUp: vi.fn().mockResolvedValue({
        data: { user, session: null },
        error: null,
      }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signUp('alice@example.com', 'Password1!');

    expect(result.kind).toBe('pending_confirmation');
    if (result.kind === 'pending_confirmation') {
      expect(result.user.id).toBe('user-123');
    }
  });

  it('returns failure when Supabase returns an error', async () => {
    const client = buildClient({
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signUp('existing@example.com', 'Password1!');

    expect(result.kind).toBe('failure');
    if (result.kind === 'failure') {
      expect(result.code).toBe('user_already_exists');
    }
  });

  it('returns failure when no user is returned and no error', async () => {
    const client = buildClient({
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signUp('alice@example.com', 'Password1!');

    expect(result.kind).toBe('failure');
  });

  it('returns failure when the SDK throws unexpectedly', async () => {
    const client = buildClient({
      signUp: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signUp('alice@example.com', 'Password1!');

    expect(result.kind).toBe('failure');
    if (result.kind === 'failure') {
      expect(result.code).toBe('network_error');
    }
  });
});

// ---------------------------------------------------------------------------
// signIn
// ---------------------------------------------------------------------------

describe('SupabaseAuthRemoteDataSource.signIn', () => {
  it('returns success on valid credentials', async () => {
    const user = buildRawUser();
    const session = buildRawSession(user);
    const client = buildClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user, session },
        error: null,
      }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signIn('alice@example.com', 'Password1!');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.user.email).toBe('alice@example.com');
      expect(result.accessToken).toBe('access-tok-xyz');
    }
  });

  it('returns failure with invalid_credentials code on bad password', async () => {
    const client = buildClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signIn('alice@example.com', 'wrong-password');

    expect(result.kind).toBe('failure');
    if (result.kind === 'failure') {
      expect(result.code).toBe('invalid_credentials');
    }
  });

  it('returns failure when session is null (no error)', async () => {
    const client = buildClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signIn('alice@example.com', 'Password1!');

    expect(result.kind).toBe('failure');
  });

  it('returns failure with too_many_requests code on rate limit', async () => {
    const client = buildClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Too many requests' },
      }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signIn('alice@example.com', 'Password1!');

    expect(result.kind).toBe('failure');
    if (result.kind === 'failure') {
      expect(result.code).toBe('too_many_requests');
    }
  });

  it('handles network error thrown by SDK', async () => {
    const client = buildClient({
      signInWithPassword: vi
        .fn()
        .mockRejectedValue(new TypeError('Failed to fetch')),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signIn('alice@example.com', 'Password1!');

    expect(result.kind).toBe('failure');
    if (result.kind === 'failure') {
      expect(result.code).toBe('network_error');
    }
  });
});

// ---------------------------------------------------------------------------
// signOut
// ---------------------------------------------------------------------------

describe('SupabaseAuthRemoteDataSource.signOut', () => {
  it('returns success on clean sign-out', async () => {
    const client = buildClient({
      signOut: vi.fn().mockResolvedValue({ error: null }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signOut();

    expect(result.kind).toBe('success');
  });

  it('passes scope to Supabase signOut', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    const client = buildClient({ signOut });

    const repo = new SupabaseAuthRemoteDataSource(client);
    await repo.signOut('global');

    expect(signOut).toHaveBeenCalledWith({ scope: 'global' });
  });

  it('defaults to local scope', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    const client = buildClient({ signOut });

    const repo = new SupabaseAuthRemoteDataSource(client);
    await repo.signOut();

    expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('returns failure when Supabase signOut returns an error', async () => {
    const client = buildClient({
      signOut: vi.fn().mockResolvedValue({
        error: { message: 'Session not found' },
      }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signOut();

    expect(result.kind).toBe('failure');
    if (result.kind === 'failure') {
      expect(result.code).toBe('session_expired');
    }
  });

  it('returns failure when SDK throws', async () => {
    const client = buildClient({
      signOut: vi.fn().mockRejectedValue(new Error('network timeout')),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signOut();

    expect(result.kind).toBe('failure');
  });
});

// ---------------------------------------------------------------------------
// getCurrentUser
// ---------------------------------------------------------------------------

describe('SupabaseAuthRemoteDataSource.getCurrentUser', () => {
  it('returns authenticated result with mapped user', async () => {
    const user = buildRawUser();
    const client = buildClient({
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.getCurrentUser();

    expect(result.kind).toBe('authenticated');
    if (result.kind === 'authenticated') {
      expect(result.user.id).toBe('user-123');
      expect(result.user.email).toBe('alice@example.com');
    }
  });

  it('returns unauthenticated when user is null and no error', async () => {
    const client = buildClient({
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.getCurrentUser();

    expect(result.kind).toBe('unauthenticated');
  });

  it('returns unauthenticated when Supabase reports missing session', async () => {
    const client = buildClient({
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth session missing' },
      }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.getCurrentUser();

    expect(result.kind).toBe('unauthenticated');
  });

  it('returns failure for non-session errors', async () => {
    const client = buildClient({
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT has expired' },
      }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.getCurrentUser();

    expect(result.kind).toBe('failure');
    if (result.kind === 'failure') {
      expect(result.code).toBe('invalid_token');
    }
  });

  it('returns failure on network error', async () => {
    const client = buildClient({
      getUser: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.getCurrentUser();

    expect(result.kind).toBe('failure');
    if (result.kind === 'failure') {
      expect(result.code).toBe('network_error');
    }
  });
});

// ---------------------------------------------------------------------------
// onAuthStateChange
// ---------------------------------------------------------------------------

describe('SupabaseAuthRemoteDataSource.onAuthStateChange', () => {
  it('calls the callback with mapped payload on SIGNED_IN event', () => {
    const user = buildRawUser();
    const session = buildRawSession(user);

    let capturedHandler: (event: string, session: unknown) => void = vi.fn();
    const unsubscribeFn = vi.fn();

    const client = buildClient({
      onAuthStateChange: vi
        .fn()
        .mockImplementation(
          (handler: (event: string, session: unknown) => void) => {
            capturedHandler = handler;
            return { data: { subscription: { unsubscribe: unsubscribeFn } } };
          }
        ),
    });

    const callback = vi.fn();
    const repo = new SupabaseAuthRemoteDataSource(client);
    repo.onAuthStateChange(callback);

    // Simulate the SDK firing a SIGNED_IN event
    capturedHandler('SIGNED_IN', session);

    expect(callback).toHaveBeenCalledOnce();
    const payload = callback.mock.calls[0][0] as AuthStateChangePayload;
    expect(payload.event).toBe('SIGNED_IN');
    expect(payload.user?.id).toBe('user-123');
    expect(payload.accessToken).toBe('access-tok-xyz');
    expect(payload.refreshToken).toBe('refresh-tok-xyz');
    expect(payload.expiresIn).toBe(3600);
  });

  it('passes null user when session is null (SIGNED_OUT)', () => {
    let capturedHandler: (event: string, session: unknown) => void = vi.fn();

    const client = buildClient({
      onAuthStateChange: vi
        .fn()
        .mockImplementation(
          (handler: (event: string, session: unknown) => void) => {
            capturedHandler = handler;
            return { data: { subscription: { unsubscribe: vi.fn() } } };
          }
        ),
    });

    const callback = vi.fn();
    const repo = new SupabaseAuthRemoteDataSource(client);
    repo.onAuthStateChange(callback);

    capturedHandler('SIGNED_OUT', null);

    const payload = callback.mock.calls[0][0] as AuthStateChangePayload;
    expect(payload.event).toBe('SIGNED_OUT');
    expect(payload.user).toBeNull();
    expect(payload.accessToken).toBeNull();
    expect(payload.refreshToken).toBeNull();
    expect(payload.expiresIn).toBeNull();
  });

  it('calls unsubscribe on the SDK subscription when unsubscribe() is called', () => {
    const unsubscribeFn = vi.fn();

    const client = buildClient({
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeFn } },
      }),
    });

    const repo = new SupabaseAuthRemoteDataSource(client);
    const subscription = repo.onAuthStateChange(vi.fn());
    subscription.unsubscribe();

    expect(unsubscribeFn).toHaveBeenCalledOnce();
  });

  it('returns a subscription object with an unsubscribe method', () => {
    const client = buildClient();
    const repo = new SupabaseAuthRemoteDataSource(client);
    const subscription = repo.onAuthStateChange(vi.fn());

    expect(typeof subscription.unsubscribe).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// Error classification edge cases
// ---------------------------------------------------------------------------

describe('Error code classification', () => {
  it('classifies email_not_confirmed correctly', async () => {
    const client = buildClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email not confirmed' },
      }),
    });
    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signIn('a@b.com', 'pw');

    expect(result.kind).toBe('failure');
    if (result.kind === 'failure') {
      expect(result.code).toBe('email_not_confirmed');
    }
  });

  it('classifies mfa_required correctly', async () => {
    const client = buildClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'MFA challenge required' },
      }),
    });
    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signIn('a@b.com', 'pw');

    expect(result.kind).toBe('failure');
    if (result.kind === 'failure') {
      expect(result.code).toBe('mfa_required');
    }
  });

  it('classifies unknown errors with unknown code', async () => {
    const client = buildClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Something completely unexpected' },
      }),
    });
    const repo = new SupabaseAuthRemoteDataSource(client);
    const result = await repo.signIn('a@b.com', 'pw');

    expect(result.kind).toBe('failure');
    if (result.kind === 'failure') {
      expect(result.code).toBe('unknown');
    }
  });
});

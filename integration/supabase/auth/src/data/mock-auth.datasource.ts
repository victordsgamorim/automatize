/**
 * MockAuthDataSource
 *
 * In-memory implementation of `AuthRepository` for local development and
 * testing without a live Supabase instance.
 *
 * Usage is controlled by the `USE_MOCK_AUTH` flag exported from
 * `./auth.factory`.  When the flag is `true` this data source is used
 * instead of `SupabaseAuthRemoteDataSource`.
 *
 * Dummy credentials (sign-up or sign-in with these):
 *   Email:    dev@automatize.local
 *   Password: Dev@123456
 *
 * Any other email/password combination will return `invalid_credentials`.
 *
 * Behaviour summary:
 * - `signUp`   — succeeds immediately (no email confirmation) if the email
 *                matches the dummy credential email; otherwise registers the
 *                new user in the in-memory store.
 * - `signIn`   — succeeds only for the dummy credentials or previously
 *                registered users.
 * - `signOut`  — always succeeds.
 * - `getCurrentUser` — returns the stored user when a session is active.
 * - `onAuthStateChange` — fires `INITIAL_SESSION` immediately and then on
 *                         every subsequent sign-in / sign-out.
 */

import { createSupabaseUser, type SupabaseUser } from './user.model';
import type {
  AuthRepository,
  AuthStateChangeCallback,
  AuthStateSubscription,
  GetCurrentUserResult,
  SignInResult,
  SignOutResult,
  SignUpResult,
} from './auth.repository';

// ---------------------------------------------------------------------------
// Dummy credential constants
// ---------------------------------------------------------------------------

/** Pre-seeded dummy user email for local development. */
export const MOCK_USER_EMAIL = 'dev@automatize.local';

/** Pre-seeded dummy user password for local development. */
export const MOCK_USER_PASSWORD = 'Dev@123456';

// ---------------------------------------------------------------------------
// Internal in-memory state
// ---------------------------------------------------------------------------

interface StoredMockUser {
  email: string;
  password: string;
  user: SupabaseUser;
}

const MOCK_USER_ID = '01HZDEV000000000000000MOCK';
const NOW = new Date().toISOString();

/** The pre-seeded dummy user object. */
const DUMMY_USER: SupabaseUser = createSupabaseUser({
  id: MOCK_USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: MOCK_USER_EMAIL,
  email_confirmed_at: NOW,
  phone: null,
  phone_confirmed_at: null,
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { display_name: 'Dev User' },
  identities: [
    {
      identity_id: MOCK_USER_ID,
      id: MOCK_USER_ID,
      user_id: MOCK_USER_ID,
      provider: 'email',
      identity_data: { email: MOCK_USER_EMAIL },
      last_sign_in_at: NOW,
      created_at: NOW,
      updated_at: NOW,
      email: MOCK_USER_EMAIL,
    },
  ],
  created_at: NOW,
  updated_at: NOW,
  last_sign_in_at: NOW,
  is_anonymous: false,
  confirmation_sent_at: null,
  recovery_sent_at: null,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFakeToken(userId: string): string {
  // Not a real JWT – only used to satisfy the `accessToken` field shape.
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      aud: 'authenticated',
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 900, // 15 min
      iat: Math.floor(Date.now() / 1000),
    })
  );
  return `${header}.${payload}.mock-signature`;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * MockAuthDataSource
 *
 * @example
 * ```ts
 * import { MockAuthDataSource } from './mock-auth.datasource';
 *
 * const authRepo = new MockAuthDataSource();
 * const result = await authRepo.signIn('dev@automatize.local', 'Dev@123456');
 * ```
 */
export class MockAuthDataSource implements AuthRepository {
  /** In-memory user store (email → stored user). */
  private readonly users = new Map<string, StoredMockUser>([
    [
      MOCK_USER_EMAIL,
      {
        email: MOCK_USER_EMAIL,
        password: MOCK_USER_PASSWORD,
        user: DUMMY_USER,
      },
    ],
  ]);

  /** Currently authenticated user (null when signed out). */
  private currentUser: SupabaseUser | null = null;

  /** Registered state-change listeners. */
  private readonly listeners = new Set<AuthStateChangeCallback>();

  // -------------------------------------------------------------------------
  // signUp
  // -------------------------------------------------------------------------

  signUp(email: string, password: string): Promise<SignUpResult> {
    if (this.users.has(email)) {
      return Promise.resolve({
        kind: 'failure',
        code: 'user_already_exists',
        message: `Mock: user already exists for email "${email}".`,
      });
    }

    const user = createSupabaseUser({
      id: `MOCK-${Date.now()}`,
      aud: 'authenticated',
      role: 'authenticated',
      email,
      email_confirmed_at: new Date().toISOString(),
      phone: null,
      phone_confirmed_at: null,
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {},
      identities: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      is_anonymous: false,
      confirmation_sent_at: null,
      recovery_sent_at: null,
    });

    this.users.set(email, { email, password, user });
    this.currentUser = user;
    this._notify('SIGNED_IN', user);

    return Promise.resolve({
      kind: 'success',
      user,
      accessToken: makeFakeToken(user.id),
      refreshToken: null,
      expiresIn: 900,
    });
  }

  // -------------------------------------------------------------------------
  // signIn
  // -------------------------------------------------------------------------

  signIn(email: string, password: string): Promise<SignInResult> {
    const stored = this.users.get(email);

    if (!stored || stored.password !== password) {
      return Promise.resolve({
        kind: 'failure',
        code: 'invalid_credentials',
        message: 'Mock: invalid email or password.',
      });
    }

    this.currentUser = stored.user;
    this._notify('SIGNED_IN', stored.user);

    return Promise.resolve({
      kind: 'success',
      user: stored.user,
      accessToken: makeFakeToken(stored.user.id),
      refreshToken: null,
      expiresIn: 900,
    });
  }

  // -------------------------------------------------------------------------
  // signOut
  // -------------------------------------------------------------------------

  signOut(_scope: 'local' | 'global' = 'local'): Promise<SignOutResult> {
    this.currentUser = null;
    this._notify('SIGNED_OUT', null);
    return Promise.resolve({ kind: 'success' });
  }

  // -------------------------------------------------------------------------
  // getCurrentUser
  // -------------------------------------------------------------------------

  getCurrentUser(): Promise<GetCurrentUserResult> {
    if (!this.currentUser) {
      return Promise.resolve({ kind: 'unauthenticated' });
    }
    return Promise.resolve({ kind: 'authenticated', user: this.currentUser });
  }

  // -------------------------------------------------------------------------
  // onAuthStateChange
  // -------------------------------------------------------------------------

  onAuthStateChange(callback: AuthStateChangeCallback): AuthStateSubscription {
    this.listeners.add(callback);

    // Fire INITIAL_SESSION immediately (mirrors Supabase SDK behaviour).
    void callback({
      event: 'INITIAL_SESSION',
      user: this.currentUser,
      accessToken: this.currentUser ? makeFakeToken(this.currentUser.id) : null,
      refreshToken: null,
      expiresIn: this.currentUser ? 900 : null,
    });

    return {
      unsubscribe: () => {
        this.listeners.delete(callback);
      },
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private _notify(
    event: 'SIGNED_IN' | 'SIGNED_OUT',
    user: SupabaseUser | null
  ): void {
    for (const cb of this.listeners) {
      void cb({
        event,
        user,
        accessToken: user ? makeFakeToken(user.id) : null,
        refreshToken: null,
        expiresIn: user ? 900 : null,
      });
    }
  }
}

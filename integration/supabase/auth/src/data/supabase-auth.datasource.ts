/**
 * SupabaseAuthRemoteDataSource
 *
 * Concrete implementation of `AuthRepository` backed by the Supabase Auth API.
 * All network calls delegate to the injected `SupabaseClient`, making this
 * class independently unit-testable (inject a stub client).
 *
 * Responsibilities:
 * - Call Supabase Auth endpoints (signUp, signInWithPassword, signOut, getUser,
 *   onAuthStateChange).
 * - Map SDK responses to the canonical `SupabaseUser` domain model.
 * - Translate Supabase errors into normalised `AuthFailure` objects.
 * - Never throw; instead return discriminated-union result types.
 *
 * Non-responsibilities:
 * - Token persistence (handled by the storage layer / Supabase client config).
 * - Business rules such as MFA enforcement or tenant resolution.
 * - State management (handled by the provider / store layer).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
import {
  createSupabaseUser,
  type SupabaseUser,
  type SupabaseUserSource,
} from './user.model';
import type {
  AuthRepository,
  AuthFailure,
  AuthFailureCode,
  AuthStateChangeCallback,
  AuthStateSubscription,
  GetCurrentUserResult,
  SignInResult,
  SignOutResult,
  SignUpResult,
} from './auth.repository';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Maps a raw Supabase SDK user to our domain `SupabaseUser`.
 * Returns `null` when the source is falsy (no active session).
 */
function mapUser(
  source: SupabaseUserSource | null | undefined
): SupabaseUser | null {
  if (!source) return null;
  return createSupabaseUser(source);
}

/**
 * Extracts a normalised `AuthFailureCode` from a Supabase error message.
 */
function classifyError(message: string): AuthFailureCode {
  const msg = message.toLowerCase();

  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid password')
  ) {
    return 'invalid_credentials';
  }
  if (msg.includes('user not found') || msg.includes('no user found')) {
    return 'user_not_found';
  }
  if (msg.includes('email not confirmed')) {
    return 'email_not_confirmed';
  }
  if (
    msg.includes('user already registered') ||
    msg.includes('user already exists') ||
    msg.includes('duplicate')
  ) {
    return 'user_already_exists';
  }
  if (msg.includes('too many') || msg.includes('rate limit')) {
    return 'too_many_requests';
  }
  if (msg.includes('mfa') || msg.includes('aal2')) {
    return 'mfa_required';
  }
  if (
    msg.includes('session') ||
    msg.includes('refresh token') ||
    msg.includes('token has expired')
  ) {
    return 'session_expired';
  }
  if (msg.includes('invalid token') || msg.includes('jwt')) {
    return 'invalid_token';
  }
  if (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network')
  ) {
    return 'network_error';
  }

  return 'unknown';
}

/**
 * Builds a typed `AuthFailure` from any caught value.
 */
function buildFailure(cause: unknown): AuthFailure {
  const message =
    cause instanceof Error
      ? cause.message
      : typeof cause === 'object' && cause !== null && 'message' in cause
        ? String((cause as { message: unknown }).message)
        : 'An unexpected error occurred';

  return {
    kind: 'failure',
    code: classifyError(message),
    message,
    cause,
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * SupabaseAuthRemoteDataSource
 *
 * @example
 * ```ts
 * import { createClient } from '@supabase/supabase-js';
 * import { SupabaseAuthRemoteDataSource } from './supabase-auth.datasource';
 *
 * const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 * const authRepo = new SupabaseAuthRemoteDataSource(client);
 *
 * const result = await authRepo.signIn('user@example.com', 'password');
 * ```
 */
export class SupabaseAuthRemoteDataSource implements AuthRepository {
  /**
   * @param client A configured Supabase JS client.  The client must have been
   *               initialised with the project URL and anon key, and with a
   *               secure storage adapter for session persistence.
   */
  constructor(private readonly client: SupabaseClient<Database>) {}

  // -------------------------------------------------------------------------
  // signUp
  // -------------------------------------------------------------------------

  /**
   * Register a new user with email and password.
   *
   * Supabase behaviour:
   * - If email confirmation is disabled: returns a session immediately.
   * - If email confirmation is enabled: returns the user but no session;
   *   the user must click the confirmation link before signing in.
   */
  async signUp(email: string, password: string): Promise<SignUpResult> {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
      });

      if (error) {
        return buildFailure(error);
      }

      const user = mapUser(data.user as SupabaseUserSource | null);

      if (!user) {
        return buildFailure(
          new Error('signUp: no user returned from Supabase')
        );
      }

      // Email confirmation required – no session yet
      if (!data.session) {
        return {
          kind: 'pending_confirmation',
          user,
        };
      }

      return {
        kind: 'success',
        user,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token ?? null,
        expiresIn: data.session.expires_in,
      };
    } catch (cause) {
      return buildFailure(cause);
    }
  }

  // -------------------------------------------------------------------------
  // signIn
  // -------------------------------------------------------------------------

  /**
   * Sign in an existing user with email and password.
   *
   * Uses `signInWithPassword` per Supabase documentation.
   */
  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return buildFailure(error);
      }

      if (!data.session || !data.user) {
        return buildFailure(
          new Error('signIn: no session or user returned from Supabase')
        );
      }

      const user = mapUser(data.user as SupabaseUserSource);

      if (!user) {
        return buildFailure(new Error('signIn: failed to map user object'));
      }

      return {
        kind: 'success',
        user,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token ?? null,
        expiresIn: data.session.expires_in,
      };
    } catch (cause) {
      return buildFailure(cause);
    }
  }

  // -------------------------------------------------------------------------
  // signOut
  // -------------------------------------------------------------------------

  /**
   * Terminate the current session.
   *
   * Even when the server call fails, the local session is cleared by the
   * Supabase client.  We report the error so callers can decide whether to
   * show a warning, but local state is always considered signed out.
   */
  async signOut(scope: 'local' | 'global' = 'local'): Promise<SignOutResult> {
    try {
      const { error } = await this.client.auth.signOut({ scope });

      if (error) {
        // The client-side session has already been cleared by the SDK.
        // Return a failure so the caller is aware of the server-side issue,
        // but treat the user as signed out locally.
        return buildFailure(error);
      }

      return { kind: 'success' };
    } catch (cause) {
      return buildFailure(cause);
    }
  }

  // -------------------------------------------------------------------------
  // getCurrentUser
  // -------------------------------------------------------------------------

  /**
   * Fetch the currently authenticated user.
   *
   * Uses `supabase.auth.getUser()` which re-validates the JWT with the
   * Supabase server — unlike `getSession()` which reads from local storage.
   * This is the recommended approach for server-authoritative user data.
   *
   * Reference: https://supabase.com/docs/reference/javascript/auth-getuser
   */
  async getCurrentUser(): Promise<GetCurrentUserResult> {
    try {
      const { data, error } = await this.client.auth.getUser();

      if (error) {
        // Supabase throws `AuthSessionMissingError` when there is no session;
        // we normalise that to `unauthenticated`.
        if (
          error.message.toLowerCase().includes('session') ||
          error.message.toLowerCase().includes('no session')
        ) {
          return { kind: 'unauthenticated' };
        }
        return buildFailure(error);
      }

      if (!data.user) {
        return { kind: 'unauthenticated' };
      }

      const user = mapUser(data.user as SupabaseUserSource);

      if (!user) {
        return buildFailure(
          new Error('getCurrentUser: failed to map user object')
        );
      }

      return { kind: 'authenticated', user };
    } catch (cause) {
      return buildFailure(cause);
    }
  }

  // -------------------------------------------------------------------------
  // onAuthStateChange
  // -------------------------------------------------------------------------

  /**
   * Subscribe to auth state changes.
   *
   * Wraps `supabase.auth.onAuthStateChange` and maps the SDK session payload
   * to the canonical `AuthStateChangePayload`.
   *
   * The Supabase SDK fires `INITIAL_SESSION` immediately upon subscription,
   * so callers receive the current state without a separate `getCurrentUser`
   * call.
   */
  onAuthStateChange(callback: AuthStateChangeCallback): AuthStateSubscription {
    const {
      data: { subscription },
    } = this.client.auth.onAuthStateChange((event, session) => {
      const user = session?.user
        ? mapUser(session.user as SupabaseUserSource)
        : null;

      void callback({
        event: event as import('./auth.repository').AuthEvent,
        user,
        accessToken: session?.access_token ?? null,
        refreshToken: session?.refresh_token ?? null,
        expiresIn: session?.expires_in ?? null,
      });
    });

    return {
      unsubscribe: () => {
        subscription.unsubscribe();
      },
    };
  }
}

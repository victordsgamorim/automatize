/**
 * AuthRepository Interface
 *
 * Abstract contract for all authentication data-access operations.
 * Implementations must fulfil this interface regardless of the underlying
 * provider (Supabase, mock, etc.), making the data layer independently
 * testable and provider-agnostic.
 *
 * Design principles:
 * - All methods are async and return explicit result types (no throws for
 *   expected failures; throws only for truly unexpected/unrecoverable errors).
 * - Return types use discriminated unions so callers handle success and
 *   failure paths at compile time.
 * - The interface is intentionally minimal – authentication only.
 *   Profile, tenant, and MFA concerns belong to separate repositories.
 */

import type { SupabaseUser } from './user.model';

// ---------------------------------------------------------------------------
// Shared result types
// ---------------------------------------------------------------------------

/**
 * Represents a successful auth operation that returns a user.
 */
export interface AuthSuccess {
  readonly kind: 'success';
  readonly user: SupabaseUser;
  /** Access token.  Treat as opaque; do not parse in the UI. */
  readonly accessToken: string;
  /** Refresh token used for silent re-authentication. */
  readonly refreshToken: string | null;
  /** Seconds until `accessToken` expires. */
  readonly expiresIn: number;
}

/**
 * Represents a sign-up that succeeded but requires email confirmation before
 * the user can sign in.  `user` is populated but `accessToken` is empty.
 */
export interface AuthPendingConfirmation {
  readonly kind: 'pending_confirmation';
  readonly user: SupabaseUser;
}

/**
 * Represents a failed auth operation with a normalised error.
 */
export interface AuthFailure {
  readonly kind: 'failure';
  readonly code: AuthFailureCode;
  readonly message: string;
  /** Raw error object for debugging (never log PII from this). */
  readonly cause?: unknown;
}

/**
 * Normalised error codes for auth failures.
 * Callers should switch on `code` rather than parse `message`.
 */
export type AuthFailureCode =
  | 'invalid_credentials'
  | 'user_not_found'
  | 'email_not_confirmed'
  | 'user_already_exists'
  | 'too_many_requests'
  | 'mfa_required'
  | 'session_expired'
  | 'invalid_token'
  | 'network_error'
  | 'unknown';

/** Result of signUp */
export type SignUpResult = AuthSuccess | AuthPendingConfirmation | AuthFailure;

/** Result of signIn */
export type SignInResult = AuthSuccess | AuthFailure;

/** Result of signOut */
export type SignOutResult = { readonly kind: 'success' } | AuthFailure;

/** Result of getCurrentUser */
export type GetCurrentUserResult =
  | { readonly kind: 'authenticated'; readonly user: SupabaseUser }
  | { readonly kind: 'unauthenticated' }
  | AuthFailure;

// ---------------------------------------------------------------------------
// Auth state change listener
// ---------------------------------------------------------------------------

/**
 * Auth event types emitted by `onAuthStateChange`.
 * Mirrors the Supabase `AuthChangeEvent` union.
 */
export type AuthEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
  | 'INITIAL_SESSION';

/**
 * Payload delivered to `AuthStateChangeCallback`.
 */
export interface AuthStateChangePayload {
  readonly event: AuthEvent;
  /** Populated for SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED. */
  readonly user: SupabaseUser | null;
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
  readonly expiresIn: number | null;
}

/**
 * Callback invoked whenever the authentication state changes.
 */
export type AuthStateChangeCallback = (
  payload: AuthStateChangePayload
) => void | Promise<void>;

/**
 * Returned by `onAuthStateChange` so the caller can clean up.
 */
export interface AuthStateSubscription {
  /** Stops delivering events.  Must be called to prevent memory leaks. */
  unsubscribe(): void;
}

// ---------------------------------------------------------------------------
// Repository interface
// ---------------------------------------------------------------------------

/**
 * AuthRepository
 *
 * Defines the contract for authentication data-access operations.
 *
 * Implementations:
 * - `SupabaseAuthRemoteDataSource` — backed by Supabase Auth API
 *
 * @example
 * ```ts
 * const repo: AuthRepository = new SupabaseAuthRemoteDataSource(client);
 *
 * const result = await repo.signIn('user@example.com', 'password');
 * if (result.kind === 'success') {
 *   console.log('Signed in as', result.user.email);
 * }
 * ```
 */
export interface AuthRepository {
  /**
   * Register a new user with email and password.
   *
   * Returns:
   * - `AuthSuccess` — user created and immediately signed in (email
   *   confirmation disabled or already confirmed).
   * - `AuthPendingConfirmation` — user created but must confirm their email
   *   before they can sign in.
   * - `AuthFailure` — registration failed (e.g. email already in use).
   *
   * @param email    The user's email address.
   * @param password The desired password (must pass Supabase policy).
   */
  signUp(email: string, password: string): Promise<SignUpResult>;

  /**
   * Authenticate an existing user with email and password.
   *
   * Returns:
   * - `AuthSuccess` — credentials valid, session created.
   * - `AuthFailure` — invalid credentials, unconfirmed email, rate-limited,
   *   or network error.
   *
   * @param email    The user's email address.
   * @param password The user's password.
   */
  signIn(email: string, password: string): Promise<SignInResult>;

  /**
   * Terminate the current session.
   *
   * Always clears local session data even if the remote call fails.
   *
   * Returns:
   * - `{ kind: 'success' }` — session terminated on both client and server.
   * - `AuthFailure` — remote sign-out failed (local state still cleared).
   *
   * @param scope `'local'` clears only this device; `'global'` revokes all
   *              sessions for the user.  Defaults to `'local'`.
   */
  signOut(scope?: 'local' | 'global'): Promise<SignOutResult>;

  /**
   * Retrieve the currently authenticated user by re-validating the JWT
   * with the Supabase server (does NOT use cached data).
   *
   * Returns:
   * - `{ kind: 'authenticated', user }` — valid session found.
   * - `{ kind: 'unauthenticated' }` — no active session.
   * - `AuthFailure` — network error or token validation failure.
   */
  getCurrentUser(): Promise<GetCurrentUserResult>;

  /**
   * Subscribe to authentication state changes.
   *
   * The callback is invoked immediately with the current state
   * (`INITIAL_SESSION`) and then on every subsequent change.
   *
   * Callers **must** call `subscription.unsubscribe()` when the listener
   * is no longer needed to avoid memory leaks.
   *
   * @param callback Function called on every auth state change.
   * @returns A subscription handle with an `unsubscribe` method.
   *
   * @example
   * ```ts
   * const subscription = repo.onAuthStateChange((payload) => {
   *   if (payload.event === 'SIGNED_IN') {
   *     console.log('User signed in:', payload.user?.email);
   *   }
   * });
   *
   * // Later, when the component unmounts:
   * subscription.unsubscribe();
   * ```
   */
  onAuthStateChange(callback: AuthStateChangeCallback): AuthStateSubscription;
}

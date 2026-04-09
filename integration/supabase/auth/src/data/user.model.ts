/**
 * Supabase User Data Model
 *
 * Explicit domain data class matching the Supabase Auth User object schema.
 * Fields are sourced from the Supabase JS SDK `User` type and the Supabase
 * Auth REST API response.
 *
 * Reference: https://supabase.com/docs/reference/javascript/auth-getuser
 */

// ---------------------------------------------------------------------------
// Supporting types
// ---------------------------------------------------------------------------

/**
 * Identity record – one entry per connected auth provider.
 * Maps to Supabase `UserIdentity`.
 */
export interface SupabaseIdentity {
  /** Identity UUID assigned by Supabase. */
  readonly identity_id: string;
  /** The user's UUID in auth.users. */
  readonly id: string;
  /** User UUID (same as the parent User.id). */
  readonly user_id: string;
  /** Identity data from the provider (profile info, tokens, etc.). */
  readonly identity_data: Record<string, unknown> | null;
  /** Auth provider name, e.g. "email", "google", "github". */
  readonly provider: string;
  /** When this identity was last used to sign in. ISO 8601 string. */
  readonly last_sign_in_at: string | null;
  /** When this identity was created. ISO 8601 string. */
  readonly created_at: string | null;
  /** When this identity was last updated. ISO 8601 string. */
  readonly updated_at: string | null;
  /** Human-readable display name from the provider. */
  readonly email?: string | null;
}

/**
 * App metadata – managed by the Supabase platform.
 * Contains provider info and custom server-managed attributes.
 * Clients cannot write to this object.
 */
export interface SupabaseAppMetadata {
  /** Primary auth provider, e.g. "email" or "google". */
  readonly provider?: string;
  /** All providers the user has connected. */
  readonly providers?: readonly string[];
  /** Any additional server-managed metadata. */
  readonly [key: string]: unknown;
}

/**
 * User metadata – written by the user or the server at sign-up.
 * Can be updated by the user via `supabase.auth.updateUser`.
 */
export interface SupabaseUserMetadata {
  /** Any metadata fields set during sign-up or subsequent updates. */
  readonly [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Primary data class
// ---------------------------------------------------------------------------

/**
 * SupabaseUser
 *
 * Immutable data class representing a Supabase Auth user.
 * This is the canonical domain model for authenticated users within the
 * `@automatize/supabase-auth` package.
 *
 * Construction is intentionally via plain object literal (factory function)
 * to stay framework-agnostic and to keep the class trivially serialisable.
 *
 * @example
 * ```ts
 * const user = createSupabaseUser(supabaseResponse.data.user);
 * console.log(user.email, user.is_anonymous);
 * ```
 */
export interface SupabaseUser {
  /**
   * UUID uniquely identifying the user in Supabase auth.users.
   * This is the primary key used across the entire system.
   */
  readonly id: string;

  /**
   * JWT "aud" claim.  Typically "authenticated" for signed-in users.
   */
  readonly aud: string;

  /**
   * Database role used by Supabase Postgres for RLS evaluation.
   * Usually "authenticated" or "anon".
   */
  readonly role: string | null;

  /** Primary email address. null when using phone-only auth. */
  readonly email: string | null;

  /** Whether the email has been confirmed. */
  readonly email_confirmed_at: string | null;

  /** Primary phone number. null when using email-only auth. */
  readonly phone: string | null;

  /** Whether the phone number has been confirmed. */
  readonly phone_confirmed_at: string | null;

  /**
   * Platform-managed metadata (e.g. provider, providers list).
   * Cannot be modified by the client.
   */
  readonly app_metadata: SupabaseAppMetadata;

  /**
   * User-writable metadata stored in Supabase.
   * Set during sign-up or updated via `updateUser`.
   */
  readonly user_metadata: SupabaseUserMetadata;

  /**
   * List of identity providers connected to this account.
   * A user with email + Google linked will have two entries.
   */
  readonly identities: readonly SupabaseIdentity[] | null;

  /** ISO 8601 timestamp of account creation. */
  readonly created_at: string;

  /** ISO 8601 timestamp of last account update. */
  readonly updated_at: string | null;

  /** ISO 8601 timestamp of last successful sign-in. */
  readonly last_sign_in_at: string | null;

  /**
   * Whether the user signed in anonymously.
   * Anonymous users have no confirmed email or phone.
   */
  readonly is_anonymous: boolean;

  /**
   * ISO 8601 timestamp when the user's action confirmation was sent.
   * Used for email change, password reset etc.
   */
  readonly confirmation_sent_at: string | null;

  /**
   * ISO 8601 timestamp when a recovery email was sent.
   */
  readonly recovery_sent_at: string | null;
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/**
 * Source shape accepted by `createSupabaseUser`.
 * Mirrors the Supabase JS SDK `User` object so callers can pass the raw
 * SDK response without transformation.
 */
export type SupabaseUserSource = {
  id: string;
  aud: string;
  role?: string | null;
  email?: string | null;
  email_confirmed_at?: string | null;
  phone?: string | null;
  phone_confirmed_at?: string | null;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  identities?: Array<{
    identity_id?: string;
    id: string;
    user_id?: string;
    identity_data?: Record<string, unknown> | null;
    provider: string;
    last_sign_in_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    email?: string | null;
  }> | null;
  created_at: string;
  updated_at?: string | null;
  last_sign_in_at?: string | null;
  is_anonymous?: boolean;
  confirmation_sent_at?: string | null;
  recovery_sent_at?: string | null;
};

/**
 * Creates an immutable `SupabaseUser` domain object from the raw Supabase SDK
 * user shape.  All optional fields are normalised to explicit `null` so
 * consumers never encounter `undefined`.
 */
export function createSupabaseUser(source: SupabaseUserSource): SupabaseUser {
  const identities: SupabaseIdentity[] | null = source.identities
    ? source.identities.map((identity) => ({
        identity_id: identity.identity_id ?? identity.id,
        id: identity.id,
        user_id: identity.user_id ?? source.id,
        identity_data: identity.identity_data ?? null,
        provider: identity.provider,
        last_sign_in_at: identity.last_sign_in_at ?? null,
        created_at: identity.created_at ?? null,
        updated_at: identity.updated_at ?? null,
        email: identity.email ?? null,
      }))
    : null;

  return Object.freeze({
    id: source.id,
    aud: source.aud,
    role: source.role ?? null,
    email: source.email ?? null,
    email_confirmed_at: source.email_confirmed_at ?? null,
    phone: source.phone ?? null,
    phone_confirmed_at: source.phone_confirmed_at ?? null,
    app_metadata: Object.freeze({ ...source.app_metadata }),
    user_metadata: Object.freeze({ ...source.user_metadata }),
    identities,
    created_at: source.created_at,
    updated_at: source.updated_at ?? null,
    last_sign_in_at: source.last_sign_in_at ?? null,
    is_anonymous: source.is_anonymous ?? false,
    confirmation_sent_at: source.confirmation_sent_at ?? null,
    recovery_sent_at: source.recovery_sent_at ?? null,
  });
}

/**
 * Returns `true` if the user has a confirmed email address.
 */
export function isEmailConfirmed(user: SupabaseUser): boolean {
  return user.email_confirmed_at !== null;
}

/**
 * Returns `true` if the user has a confirmed phone number.
 */
export function isPhoneConfirmed(user: SupabaseUser): boolean {
  return user.phone_confirmed_at !== null;
}

/**
 * Returns the primary auth provider for the user (from app_metadata).
 * Falls back to "email" when the field is absent.
 */
export function getPrimaryProvider(user: SupabaseUser): string {
  return user.app_metadata.provider ?? 'email';
}

/**
 * Returns all connected provider names.
 */
export function getProviders(user: SupabaseUser): readonly string[] {
  const providers = user.app_metadata.providers;
  if (Array.isArray(providers)) return providers as string[];
  const primary = getPrimaryProvider(user);
  return [primary];
}

/**
 * Auth Repository Factory
 *
 * Single place to toggle between the real Supabase implementation and the
 * in-memory mock.  Flip `USE_MOCK_AUTH` to `true` during local development
 * when you do not want (or do not have) a live Supabase project.
 *
 * How to use
 * ----------
 * 1. Set USE_MOCK_AUTH = true  → MockAuthDataSource is returned.
 *    Dummy credentials:
 *      email:    dev@automatize.local
 *      password: Dev@123456
 *
 * 2. Set USE_MOCK_AUTH = false → SupabaseAuthRemoteDataSource is returned.
 *    You must pass a configured `SupabaseClient` as the argument.
 *
 * @example
 * ```ts
 * // Somewhere in your app bootstrap (e.g. apps/mobile/src/app.tsx):
 * import { createAuthRepository } from '@automatize/supabase-auth/data/auth.factory';
 * import { getSupabaseClient } from '@automatize/supabase-auth';
 *
 * const authRepo = createAuthRepository(getSupabaseClient());
 * ```
 *
 * Never import `USE_MOCK_AUTH` in production code that gets shipped; it is
 * a build-time / development toggle only.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
import type { AuthRepository } from './auth.repository';
import { MockAuthDataSource } from './mock-auth.datasource';
import { SupabaseAuthRemoteDataSource } from './supabase-auth.datasource';

// ---------------------------------------------------------------------------
// Feature flag
// ---------------------------------------------------------------------------

/**
 * When `true`, all auth calls go to the in-memory `MockAuthDataSource`.
 * When `false`, auth calls go to `SupabaseAuthRemoteDataSource`.
 *
 * Change this value during local development to avoid needing a live
 * Supabase project.  This flag must NEVER be `true` in a production build.
 */
export const USE_MOCK_AUTH: boolean = true;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Returns the appropriate `AuthRepository` implementation based on the
 * `USE_MOCK_AUTH` flag.
 *
 * @param client - A configured Supabase client.  Required when
 *                 `USE_MOCK_AUTH` is `false`; ignored when `true`.
 *
 * @example
 * ```ts
 * // Mock mode (USE_MOCK_AUTH = true) – no client needed:
 * const repo = createAuthRepository();
 *
 * // Real mode (USE_MOCK_AUTH = false) – client required:
 * const repo = createAuthRepository(supabaseClient);
 * ```
 */
export function createAuthRepository(
  client?: SupabaseClient<Database>
): AuthRepository {
  if (USE_MOCK_AUTH) {
    return new MockAuthDataSource();
  }

  if (!client) {
    throw new Error(
      'createAuthRepository: a SupabaseClient must be provided when USE_MOCK_AUTH is false.'
    );
  }

  return new SupabaseAuthRemoteDataSource(client);
}

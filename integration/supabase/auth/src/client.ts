/**
 * Supabase Client Initialization
 * Lazy-loaded client that avoids platform-specific imports at bundle time.
 *
 * ## Secure storage
 *
 * Pass a `storage` adapter via `initializeAuth` (or directly to
 * `createSupabaseClient`) to control where session tokens are persisted.
 *
 * Recommended adapters (see `./storage/secure-storage.adapter`):
 * - `CookieStorageAdapter`  — httpOnly cookie delegation (web, SSR)
 * - `InMemoryStorageAdapter` — non-persistent, XSS-safe (SSR, tests)
 * - `MobileTokenStorage`    — expo-secure-store (iOS / Android)
 */

import {
  createClient,
  SupabaseClient as SupabaseClientType,
} from '@supabase/supabase-js';
import { getAuthConfig } from './config';
import type { Database } from './types/database.types';
import type { ISecureStorageAdapter } from './storage/secure-storage.adapter';

let supabaseInstance: SupabaseClientType<Database> | null = null;

/**
 * Create a new Supabase client with the given storage adapter.
 *
 * Call this directly when you want a one-off client (e.g. per-request in SSR)
 * rather than using the global singleton.
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  storage?: ISecureStorageAdapter
): SupabaseClientType<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      ...(storage ? { storage } : {}),
    },
    // For React Native, use the native fetch
    global: {
      fetch: fetch.bind(globalThis),
    },
  });
}

/**
 * Get or create the global Supabase client singleton (lazy initialization).
 * This avoids platform-specific imports until actually needed.
 *
 * The first call reads config from `initializeAuth`.  Subsequent calls return
 * the cached instance.  To force a new instance (e.g. after logout / config
 * change) call `resetSupabaseClient()` first.
 */
export function getSupabaseClient(): SupabaseClientType<Database> {
  if (!supabaseInstance) {
    const config = getAuthConfig();

    supabaseInstance = createSupabaseClient(
      config.supabaseUrl,
      config.supabaseAnonKey,
      // Storage is optional — when absent Supabase falls back to localStorage
      // in the browser or an in-memory store on Node/RN.
      config.storage
    );
  }

  return supabaseInstance;
}

/**
 * Export Supabase client type for TypeScript
 */
export type SupabaseClient = SupabaseClientType<Database>;

/**
 * Legacy export for backwards compatibility
 * Lazy loads on first access
 */
export const supabase = new Proxy({} as SupabaseClientType<Database>, {
  get(target, prop) {
    const client = getSupabaseClient();
    return Reflect.get(client, prop) as unknown;
  },
});

/**
 * Helper to check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  try {
    getAuthConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current Supabase URL (useful for deep linking)
 */
export function getSupabaseUrl(): string {
  const config = getAuthConfig();
  return config.supabaseUrl;
}

/**
 * Get the project ID from the Supabase URL
 */
export function getSupabaseProjectId(): string {
  const url = getSupabaseUrl();
  const match = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
  if (!match || !match[1]) {
    throw new Error('Could not extract project ID from Supabase URL');
  }
  return match[1];
}

/**
 * Reset Supabase client (useful for testing or logout)
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

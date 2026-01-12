/**
 * Supabase Client Initialization
 * Lazy-loaded client that avoids platform-specific imports at bundle time
 */

import { createClient } from "@supabase/supabase-js";
import { getAuthConfig } from "./config";

let supabaseInstance: ReturnType<typeof createClient> | null = null;

/**
 * Get or create the Supabase client (lazy initialization)
 * This avoids platform-specific imports until actually needed
 */
export function getSupabaseClient() {
  if (!supabaseInstance) {
    const config = getAuthConfig();

    supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      // For React Native, use the native fetch
      global: {
        fetch: fetch.bind(globalThis),
      },
    });
  }

  return supabaseInstance;
}

/**
 * Export Supabase client type for TypeScript
 */
export type SupabaseClient = ReturnType<typeof getSupabaseClient>;

/**
 * Legacy export for backwards compatibility
 * Lazy loads on first access
 */
export const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(target, prop) {
    const client = getSupabaseClient();
    return Reflect.get(client, prop);
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
    throw new Error("Could not extract project ID from Supabase URL");
  }
  return match[1];
}

/**
 * Reset Supabase client (useful for testing or logout)
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

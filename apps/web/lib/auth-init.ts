/**
 * Auth Initialization for Web App
 * Initialize auth with web-specific storage and configuration
 *
 * This file is imported at app startup to configure the @automatize/auth package
 */

import {
  initializeAuth,
  type AuthConfig,
} from "@automatize/auth";
import { createWebTokenStorage } from "@automatize/auth/storage/implementations/webTokenStorage";

/**
 * Get Supabase configuration from environment variables
 */
function getSupabaseConfig(): AuthConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  return {
    supabaseUrl: url,
    supabaseAnonKey: anonKey,
  };
}

/**
 * Initialize auth with web-specific configuration
 * Call this once at app startup (e.g., in layout or _document)
 */
export function initializeAuthForWeb(): void {
  try {
    const config = getSupabaseConfig();
    const tokenStorage = createWebTokenStorage();

    initializeAuth(config, tokenStorage);

    console.info("Auth initialized for web");
  } catch (error) {
    console.error("Failed to initialize auth:", error);
    throw error;
  }
}

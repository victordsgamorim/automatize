/**
 * Auth Initialization for Web App
 * Initialize auth with web-specific storage and configuration
 *
 * This file is imported at app startup to configure the @automatize/supabase-auth package.
 * When USE_MOCK_AUTH is true the Supabase initialization is skipped entirely – the
 * MockAuthProvider handles authentication in-memory without any network calls.
 */

import {
  initializeAuth,
  type AuthConfig,
  USE_MOCK_AUTH,
} from '@automatize/supabase-auth';
import { createWebTokenStorage } from '@automatize/supabase-auth/adapters/web';

/**
 * Get Supabase configuration from environment variables.
 * Only called when USE_MOCK_AUTH is false.
 */
function getSupabaseConfig(): AuthConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
  }

  return {
    supabaseUrl: url,
    supabaseAnonKey: anonKey,
  };
}

/**
 * Initialize auth with web-specific configuration.
 * Call this once at app startup (e.g., in layout or _document).
 *
 * When USE_MOCK_AUTH is true this is a no-op – MockAuthProvider takes over.
 */
export function initializeAuthForWeb(): void {
  // Skip real Supabase initialization when running in mock mode.
  // The MockAuthProvider will supply the AuthContext directly.
  if (USE_MOCK_AUTH) {
    return;
  }

  try {
    const config = getSupabaseConfig();
    const tokenStorage = createWebTokenStorage();

    initializeAuth(config, tokenStorage);
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    throw error;
  }
}

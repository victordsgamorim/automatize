/**
 * Auth Initialization for Mobile App
 * Initialize auth with mobile-specific storage and configuration
 *
 * This file is imported at app startup to configure the @automatize/auth package
 */

import Constants from 'expo-constants';
import { initializeAuth, type AuthConfig } from '@automatize/auth';
import { createMobileTokenStorage } from '@automatize/auth/adapters/mobile';

/**
 * Get Supabase configuration from Expo constants
 */
function getSupabaseConfig(): AuthConfig {
  const expoConfig = Constants.expoConfig?.extra;

  if (!expoConfig?.supabaseUrl || !expoConfig?.supabaseAnonKey) {
    throw new Error(
      'Missing Supabase configuration in app.json. Set "extra.supabaseUrl" and "extra.supabaseAnonKey".'
    );
  }

  return {
    supabaseUrl: expoConfig.supabaseUrl,
    supabaseAnonKey: expoConfig.supabaseAnonKey,
  };
}

/**
 * Initialize auth with mobile-specific configuration
 * Call this once at app startup (e.g., in root layout or _layout.tsx)
 */
export function initializeAuthForMobile(): void {
  try {
    const config = getSupabaseConfig();
    const tokenStorage = createMobileTokenStorage();

    initializeAuth(config, tokenStorage);

    console.info('Auth initialized for mobile');
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    throw error;
  }
}

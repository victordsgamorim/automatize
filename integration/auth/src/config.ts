/**
 * Auth Configuration Provider
 * Platform-agnostic configuration that can be set by apps
 * This prevents direct imports of platform-specific modules at bundle time
 */

export interface AuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface ITokenStorage {
  saveTokens(tokens: StoredTokens): Promise<void>;
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  getUserId(): Promise<string | null>;
  getTokenExpiry(): Promise<number | null>;
  clearTokens(): Promise<void>;
  hasTokens(): Promise<boolean>;
}

export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  userId?: string;
}

/**
 * Global auth configuration
 * Must be set before using any auth features
 */
let authConfig: AuthConfig | null = null;
let tokenStorageImpl: ITokenStorage | null = null;

/**
 * Initialize auth with app-specific configuration
 * Call this in your app's entry point (before using auth)
 */
export function initializeAuth(
  config: AuthConfig,
  tokenStorage: ITokenStorage
): void {
  authConfig = config;
  tokenStorageImpl = tokenStorage;
}

/**
 * Get the current auth configuration
 */
export function getAuthConfig(): AuthConfig {
  if (!authConfig) {
    throw new Error(
      'Auth not configured. Call initializeAuth() in your app entry point before using auth features.'
    );
  }
  return authConfig;
}

/**
 * Get the current token storage implementation
 */
export function getTokenStorage(): ITokenStorage {
  if (!tokenStorageImpl) {
    throw new Error(
      'Token storage not configured. Call initializeAuth() in your app entry point before using auth features.'
    );
  }
  return tokenStorageImpl;
}

/**
 * Check if auth is configured
 */
export function isAuthConfigured(): boolean {
  return authConfig !== null && tokenStorageImpl !== null;
}

/**
 * Reset auth configuration (useful for testing)
 */
export function resetAuthConfig(): void {
  authConfig = null;
  tokenStorageImpl = null;
}

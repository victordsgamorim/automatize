/**
 * @automatize/auth
 * Authentication and multi-tenancy library for Automatize
 */

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

// Types
export type {
  AuthUser,
  UserProfile,
  Tenant,
  TenantMember,
  MFABackupCode,
  JWTClaims,
  AuthContextType,
  UserRole,
} from "./types/auth.types";

// Schemas
export {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  mfaSetupSchema,
  createTenantSchema,
  emailSchema,
  passwordSchema,
  totpCodeSchema,
  backupCodeSchema,
  tenantNameSchema,
  tenantSlugSchema,
} from "./schemas/auth.schemas";

// ============================================================================
// CONFIGURATION & INITIALIZATION
// ============================================================================

export {
  initializeAuth,
  getAuthConfig,
  getTokenStorage,
  isAuthConfigured,
  resetAuthConfig,
} from "./config";
export type {
  AuthConfig,
  ITokenStorage,
  StoredTokens,
} from "./config";

// ============================================================================
// CLIENT & STORAGE
// ============================================================================

export {
  supabase,
  getSupabaseClient,
  isSupabaseConfigured,
  getSupabaseUrl,
  getSupabaseProjectId,
  resetSupabaseClient,
} from "./client";
export { tokenStorage, isTokenExpired, getTokenExpiresIn } from "./storage/tokenStorage";
export type { ITokenStorage as TokenStorage } from "./storage/tokenStorage";

// Note: Storage implementations (createWebTokenStorage, createMobileTokenStorage)
// are not exported here to prevent platform-specific code from being bundled.
// Import directly from their respective files:
// - import { createWebTokenStorage } from '@automatize/auth/storage/implementations/webTokenStorage'
// - import { createMobileTokenStorage } from '@automatize/auth/storage/implementations/mobileTokenStorage'

// ============================================================================
// HOOKS
// ============================================================================

export {
  useAuth,
  useIsAuthenticated,
  useCurrentUser,
  useCurrentTenant,
  useLogout,
  useUserEmail,
  useDisplayName,
} from "./hooks/useAuth";

export { useSession, getSessionTimeRemaining, shouldRefreshSession } from "./hooks/useSession";

export { useMFA } from "./hooks/useMFA";
export type { MFASetupState } from "./hooks/useMFA";

export { useTenant } from "./hooks/useTenant";

// ============================================================================
// UTILITIES
// ============================================================================

// JWT utilities
export {
  decodeJWT,
  getJWTClaims,
  getCurrentTenantId,
  getCurrentRole,
  getTenantIds,
  isJWTExpired,
  getJWTExpirationTime,
  getJWTIssuedAt,
  getJWTTimeRemaining,
  shouldRefreshJWT,
} from "./utils/jwt";

// Error utilities
export {
  createAuthError,
  parseSupabaseError,
  getErrorMessage,
  parseValidationErrors,
  isAuthError,
  isRecoverableError,
  getRetryDelay,
  redactPIIFromError,
} from "./utils/errors";

// ============================================================================
// PROVIDERS
// ============================================================================

export { AuthProvider, AuthContext } from "./providers/AuthProvider";
export type { AuthProviderProps } from "./providers/AuthProvider";

// ============================================================================
// VERSION
// ============================================================================

export const AUTH_VERSION = "1.0.0-alpha";

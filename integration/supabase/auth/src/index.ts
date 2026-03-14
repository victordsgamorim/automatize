/**
 * @automatize/supabase-auth — Public API
 *
 * The single entry point for all consumers.
 *
 * Public surface (what feature code is allowed to import):
 *   - useUserAuthentication  ← the ONE hook consumers should use
 *   - AuthProvider           ← wraps the app (real Supabase)
 *   - MockAuthProvider       ← wraps the app (local dev / tests)
 *   - USE_MOCK_AUTH          ← flag read by app bootstrap only
 *   - Domain types           ← AuthUser, UserProfile, Tenant, UserRole
 *   - Zod schemas            ← for form validation in feature code
 *
 * Everything else (AuthRepository, data sources, factory, JWT utils, storage,
 * Supabase client, raw hooks) is intentionally NOT exported. Consumers must
 * not reach into the internals of this package.
 */

// ============================================================================
// PRIMARY HOOK  ← use this in all feature components
// ============================================================================

export { useUserAuthentication } from './hooks/useUserAuthentication';
export type { UserAuthentication } from './hooks/useUserAuthentication';

// ============================================================================
// PROVIDERS  ← used once in app bootstrap, not in feature code
// ============================================================================

export { AuthProvider } from './providers/AuthProvider';
export type { AuthProviderProps } from './providers/AuthProvider';

export { MockAuthProvider } from './providers/MockAuthProvider';
export type { MockAuthProviderProps } from './providers/MockAuthProvider';

// ============================================================================
// FEATURE FLAG  ← read by app bootstrap to choose the right provider
// ============================================================================

export { USE_MOCK_AUTH } from './data/auth.factory';

// ============================================================================
// DOMAIN TYPES  ← used in component props, route params, etc.
// ============================================================================

export type {
  AuthUser,
  UserProfile,
  Tenant,
  TenantMember,
  UserRole,
} from './types/auth.types';

// ============================================================================
// VALIDATION SCHEMAS  ← used in feature forms (login, register, etc.)
// ============================================================================

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
} from './schemas/auth.schemas';

// ============================================================================
// APP INITIALISATION  ← called once in platform bootstrap (not feature code)
// ============================================================================

export { initializeAuth, isAuthConfigured } from './config';
export type { AuthConfig } from './config';

// ============================================================================
// VERSION
// ============================================================================

export const AUTH_VERSION = '1.0.0-alpha';

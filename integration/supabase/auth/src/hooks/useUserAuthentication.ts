/**
 * useUserAuthentication
 *
 * The single public hook for authentication across all consumers.
 * Encapsulates the repository, data source, and provider details —
 * callers never need to import or instantiate those directly.
 *
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { login, isLoading, error } = useUserAuthentication();
 *
 *   const handleSubmit = async (email: string, password: string) => {
 *     await login(email, password);
 *     // navigate to dashboard
 *   };
 * }
 *
 * function Header() {
 *   const { user, isAuthenticated, logout } = useUserAuthentication();
 *   if (!isAuthenticated) return null;
 *   return <button onClick={logout}>{user?.email}</button>;
 * }
 * ```
 */

import type { AuthUser, UserProfile, Tenant } from '../types/auth.types';
import { useAuth } from './useAuth';

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

/**
 * The return type of `useUserAuthentication`.
 *
 * Only the fields that feature code should ever need are exposed.
 * Repository, datasource, and session internals remain inside the module.
 */
export interface UserAuthentication {
  // ---- State ----------------------------------------------------------------

  /** The currently authenticated user, or `null` when signed out. */
  readonly user: AuthUser | null;

  /** Authenticated user's profile (display name, default tenant, etc.). */
  readonly userProfile: UserProfile | null;

  /** The active tenant / workspace. */
  readonly currentTenant: Tenant | null;

  /** `true` when a user session is active. */
  readonly isAuthenticated: boolean;

  /**
   * `true` while any auth operation (login, logout, register, …) is in
   * progress.  Use this to disable form controls and show loading indicators.
   */
  readonly isLoading: boolean;

  /**
   * Human-readable error from the last failed operation, or `null` when the
   * last operation succeeded.  Cleared automatically at the start of each new
   * operation.
   */
  readonly error: string | null;

  // ---- Actions --------------------------------------------------------------

  /**
   * Sign in with email and password.
   *
   * Throws when credentials are invalid or the operation fails so callers
   * can catch and display feedback.
   *
   * @param email     The user's email address.
   * @param password  The user's password.
   * @param mfaCode   Optional TOTP code when MFA is enforced.
   */
  login(email: string, password: string, mfaCode?: string): Promise<void>;

  /**
   * Sign out the current user and clear the local session.
   * Always resolves — errors during remote sign-out are swallowed and the
   * local session is cleared regardless.
   */
  logout(): Promise<void>;

  /**
   * Register a new account.
   *
   * @param email        The new user's email address.
   * @param password     The desired password.
   * @param displayName  Human-readable name shown in the UI.
   */
  register(email: string, password: string, displayName: string): Promise<void>;

  /**
   * Trigger a password-reset email.
   *
   * @param email  The account email to send the reset link to.
   */
  resetPassword(email: string): Promise<void>;

  /**
   * Change the password of the currently authenticated user.
   * Requires an active session (typically called from the reset-password
   * deep-link flow after the user has clicked the email link).
   *
   * @param newPassword  The new password to set.
   */
  updatePassword(newPassword: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useUserAuthentication
 *
 * Returns auth state and actions for the currently authenticated user.
 * Must be called inside a component tree wrapped by `AuthProvider` (real
 * Supabase) or `MockAuthProvider` (local development / testing).
 *
 * @throws {Error} When called outside of an AuthProvider tree.
 */
export function useUserAuthentication(): UserAuthentication {
  const {
    user,
    userProfile,
    currentTenant,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
  } = useAuth();

  return {
    user,
    userProfile,
    currentTenant,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
  };
}

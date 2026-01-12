/**
 * useAuth Hook
 * Main authentication hook for login, register, logout, and session management
 */

import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";
import { AuthContextType } from "../types/auth.types";

/**
 * useAuth hook
 * Provides access to authentication methods and state
 *
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { login, isLoading, error } = useAuth();
 *
 *   const handleLogin = async (email: string, password: string, mfaCode?: string) => {
 *     try {
 *       await login(email, password, mfaCode);
 *       // Navigate to app
 *     } catch (err) {
 *       console.error('Login failed:', err);
 *     }
 *   };
 *
 *   return (
 *     <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider. " +
        "Make sure your app is wrapped with <AuthProvider>.</AuthProvider>"
    );
  }

  return context;
}

/**
 * Hook to check if user is authenticated
 * Shorter convenience hook for simple auth checks
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { user, userProfile } = useAuth();
  return { user, userProfile };
}

/**
 * Hook to get current tenant
 */
export function useCurrentTenant() {
  const { currentTenant } = useAuth();
  return currentTenant;
}

/**
 * Hook to logout
 */
export function useLogout() {
  const { logout, isLoading } = useAuth();
  return { logout, isLoading };
}

/**
 * Helper to get user's email (with safe redaction)
 */
export function useUserEmail(): string | null {
  const { user } = useAuth();
  if (!user?.email) return null;
  // Return partial email for privacy
  const [local] = user.email.split("@");
  return local ? `${local}@...` : null;
}

/**
 * Helper to get user's display name
 */
export function useDisplayName(): string | null {
  const { userProfile } = useAuth();
  return userProfile?.display_name ?? null;
}

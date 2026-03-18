/**
 * Core auth contract — platform-agnostic, provider-agnostic.
 *
 * Intentionally minimal: only exposes what feature packages
 * (e.g. @automatize/sign-in) actually consume.
 * The full auth surface lives in @automatize/supabase-auth.
 */

/**
 * The minimal auth value that feature packages depend on.
 * Implementations (e.g. Supabase AuthProvider) must satisfy this interface.
 */
export interface AuthContextValue {
  readonly isLoading: boolean;
  login(email: string, password: string): Promise<void>;
}

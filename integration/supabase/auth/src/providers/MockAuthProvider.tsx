/**
 * MockAuthProvider
 *
 * Provides the AuthContext to any React tree using the in-memory
 * MockAuthDataSource — no Supabase project or environment variables required.
 *
 * Intended for local development and automated tests only.
 * Controlled by the USE_MOCK_AUTH flag in the auth factory; never ship
 * this provider in a production build.
 *
 * Dummy credentials:
 *   email:    dev@automatize.local
 *   password: Dev@123456
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AuthContext } from './AuthProvider';
import { createAuthRepository } from '../data/auth.factory';
import {
  MOCK_USER_EMAIL,
  MOCK_USER_PASSWORD,
} from '../data/mock-auth.datasource';
import type {
  AuthContextType,
  AuthUser,
  Tenant,
  UserProfile,
} from '../types/auth.types';

// ---------------------------------------------------------------------------
// Internal constants
// ---------------------------------------------------------------------------

/** Stable repository instance (one per module load). */
const _repo = createAuthRepository();

const _TENANT: Tenant = {
  id: '01HZDEV000000000000000TNNT',
  name: "Dev's workspace",
  slug: 'dev',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
};

const _PROFILE: UserProfile = {
  id: '01HZDEV000000000000000MOCK',
  display_name: 'Dev User',
  default_tenant_id: _TENANT.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function _toAuthUser(raw: unknown): AuthUser {
  // Our SupabaseUser domain model is structurally compatible with AuthUser.
  return raw as AuthUser;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface MockAuthProviderProps {
  children: ReactNode;
}

/**
 * MockAuthProvider
 *
 * Drop-in replacement for `AuthProvider` during local development.
 * Renders a fixed banner at the bottom of the viewport showing the active
 * dummy credentials so developers always know mock mode is enabled.
 *
 * @example
 * ```tsx
 * // In your app bootstrap (e.g. apps/web/app/auth-provider.tsx):
 * import { USE_MOCK_AUTH, MockAuthProvider, AuthProvider } from '@automatize/supabase-auth';
 *
 * function AuthProviderWrapper({ children }) {
 *   if (USE_MOCK_AUTH) return <MockAuthProvider>{children}</MockAuthProvider>;
 *   return <AuthProvider>{children}</AuthProvider>;
 * }
 * ```
 */
export function MockAuthProvider({ children }: MockAuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const repoRef = useRef(_repo);

  // Subscribe to auth state changes from the mock repository.
  useEffect(() => {
    const sub = repoRef.current.onAuthStateChange((payload) => {
      if (
        payload.event === 'INITIAL_SESSION' ||
        payload.event === 'SIGNED_IN'
      ) {
        setUser(payload.user ? _toAuthUser(payload.user) : null);
        setIsLoading(false);
        return;
      }
      if (payload.event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    });

    return () => sub.unsubscribe();
  }, []);

  // ---- Actions ------------------------------------------------------------

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await repoRef.current.signIn(email, password);
        if (result.kind === 'success') {
          setUser(_toAuthUser(result.user));
        } else {
          setError(result.message);
          throw new Error(result.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loginWithBackupCode = useCallback(
    async (
      email: string,
      password: string,
      _backupCode: string
    ): Promise<void> => {
      await login(email, password);
    },
    [login]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      _displayName: string
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await repoRef.current.signUp(email, password);
        if (result.kind === 'success') {
          setUser(_toAuthUser(result.user));
        } else if (result.kind === 'failure') {
          setError(result.message);
          throw new Error(result.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await repoRef.current.signOut('local');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (_email: string): Promise<void> => {
    // Mock: no-op — no email is sent.
  }, []);

  const updatePassword = useCallback(
    async (_newPassword: string): Promise<void> => {
      // Mock: no-op.
    },
    []
  );

  const switchTenant = useCallback(async (_tenantId: string): Promise<void> => {
    // Mock: single tenant only — no-op.
  }, []);

  const createTenant = useCallback(async (_name: string): Promise<Tenant> => {
    return _TENANT;
  }, []);

  // ---- Context value ------------------------------------------------------

  const value: AuthContextType = useMemo(
    () => ({
      user,
      userProfile: user ? _PROFILE : null,
      currentTenant: user ? _TENANT : null,
      isAuthenticated: user !== null,
      isLoading,
      error,
      login,
      loginWithBackupCode,
      register,
      logout,
      resetPassword,
      updatePassword,
      switchTenant,
      createTenant,
    }),
    [
      user,
      isLoading,
      error,
      login,
      loginWithBackupCode,
      register,
      logout,
      resetPassword,
      updatePassword,
      switchTenant,
      createTenant,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <_MockBanner />
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Dev banner
// ---------------------------------------------------------------------------

function _MockBanner() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#7c3aed',
        color: '#ffffff',
        fontSize: '12px',
        padding: '4px 12px',
        textAlign: 'center',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      Mock Auth &mdash; credentials: <strong>{MOCK_USER_EMAIL}</strong> /{' '}
      <strong>{MOCK_USER_PASSWORD}</strong>
    </div>
  );
}

/**
 * useAuthRepository Hook
 *
 * React hook that exposes the full authentication data layer to components.
 * It wraps an `AuthRepository` instance and manages local React state for:
 *
 * - The currently authenticated `SupabaseUser` (or `null`)
 * - A loading flag that is `true` while any async operation is in flight
 * - The last `AuthFailure` (cleared at the start of each new operation)
 *
 * ## Architecture
 *
 * This hook sits at the boundary between the data layer (`AuthRepository`)
 * and the presentation layer.  It does not contain business logic — it only
 * calls the repository and reflects the result as React state.
 *
 * The repository is injected via parameter (not a global singleton), making
 * the hook independently testable without mocking module imports.
 *
 * ## Usage
 *
 * ```tsx
 * // 1. Create the repository once (e.g. at the app root or in a provider)
 * const authRepo = new SupabaseAuthRemoteDataSource(supabaseClient);
 *
 * // 2. Use the hook in any component
 * function LoginScreen() {
 *   const { signIn, user, isLoading, failure } = useAuthRepository(authRepo);
 *
 *   const handleSubmit = async () => {
 *     const result = await signIn('alice@example.com', 'Password1!');
 *     if (result.kind === 'success') {
 *       // navigate to home
 *     }
 *   };
 *
 *   return (
 *     <>
 *       {failure && <Text>{failure.message}</Text>}
 *       <Button onPress={handleSubmit} disabled={isLoading} />
 *     </>
 *   );
 * }
 * ```
 *
 * ## State machine
 *
 * ```
 *              signIn / signUp / signOut / getCurrentUser
 *                         │
 *           ┌─────────────▼──────────────┐
 *           │  isLoading = true           │
 *           │  failure   = null           │
 *           └─────────────┬──────────────┘
 *                         │
 *          ┌──────────────┼──────────────┐
 *     success / pending  failure       signOut
 *          │                │               │
 *    user = User        failure = F    user = null
 *    isLoading = false  isLoading=false isLoading=false
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  AuthRepository,
  AuthFailure,
  SignUpResult,
  SignInResult,
  SignOutResult,
} from '../data/auth.repository';
import type { SupabaseUser } from '../data/user.model';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * State exposed by `useAuthRepository`.
 */
export interface AuthRepositoryState {
  /** The currently authenticated user, or `null` when signed out. */
  user: SupabaseUser | null;
  /**
   * `true` while an async auth operation (signIn, signUp, signOut,
   * getCurrentUser) is in progress.
   */
  isLoading: boolean;
  /**
   * The failure from the most recent operation, or `null` when the last
   * operation succeeded.  Cleared automatically at the start of each new
   * operation.
   */
  failure: AuthFailure | null;
  /** `true` when `user` is non-null. Convenience alias. */
  isAuthenticated: boolean;
}

/**
 * Actions and helpers exposed by `useAuthRepository`.
 */
export interface AuthRepositoryActions {
  /**
   * Register a new user.
   *
   * Sets `user` on immediate success; leaves `user` null and populates
   * `failure` on error or when email confirmation is pending.
   *
   * @returns The raw `SignUpResult` so callers can distinguish between
   *          `success` and `pending_confirmation`.
   */
  signUp(email: string, password: string): Promise<SignUpResult>;

  /**
   * Sign in with email and password.
   *
   * Sets `user` on success; populates `failure` on error.
   *
   * @returns The raw `SignInResult`.
   */
  signIn(email: string, password: string): Promise<SignInResult>;

  /**
   * Sign out the current user.
   *
   * Clears `user` regardless of whether the server call succeeded.
   *
   * @returns The raw `SignOutResult`.
   */
  signOut(scope?: 'local' | 'global'): Promise<SignOutResult>;

  /**
   * Fetch the current user from the server and update local state.
   *
   * Useful for validating the session on app startup or after a deep link.
   */
  refreshUser(): Promise<void>;

  /** Manually clear the last `failure` from state. */
  clearFailure(): void;
}

export type UseAuthRepositoryReturn = AuthRepositoryState &
  AuthRepositoryActions;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useAuthRepository
 *
 * @param repository An `AuthRepository` implementation.  Create this once
 *                   (e.g. `new SupabaseAuthRemoteDataSource(client)`) and
 *                   pass the same instance on every render (or memoize it).
 */
export function useAuthRepository(
  repository: AuthRepository
): UseAuthRepositoryReturn {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true until INITIAL_SESSION fires
  const [failure, setFailure] = useState<AuthFailure | null>(null);

  // Keep a stable ref to the repository so effects don't re-run when the
  // caller re-creates the repository object (common in tests).
  const repoRef = useRef(repository);
  repoRef.current = repository;

  // ---------------------------------------------------------------------------
  // Auth state subscription — runs once on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const subscription = repoRef.current.onAuthStateChange((payload) => {
      if (payload.event === 'INITIAL_SESSION') {
        setUser(payload.user);
        setIsLoading(false);
        return;
      }

      if (
        payload.event === 'SIGNED_IN' ||
        payload.event === 'TOKEN_REFRESHED' ||
        payload.event === 'USER_UPDATED'
      ) {
        setUser(payload.user);
        return;
      }

      if (payload.event === 'SIGNED_OUT') {
        setUser(null);
        return;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // intentionally empty — repoRef.current is used inside

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const signUp = useCallback(
    async (email: string, password: string): Promise<SignUpResult> => {
      setIsLoading(true);
      setFailure(null);

      try {
        const result = await repoRef.current.signUp(email, password);

        if (result.kind === 'success') {
          setUser(result.user);
        } else if (result.kind === 'failure') {
          setFailure(result);
        }
        // pending_confirmation: user created but not yet signed in — leave user null

        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      setIsLoading(true);
      setFailure(null);

      try {
        const result = await repoRef.current.signIn(email, password);

        if (result.kind === 'success') {
          setUser(result.user);
        } else {
          setFailure(result);
        }

        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(
    async (scope: 'local' | 'global' = 'local'): Promise<SignOutResult> => {
      setIsLoading(true);
      setFailure(null);

      try {
        const result = await repoRef.current.signOut(scope);

        // Always clear local user state — even on failure the local session
        // is gone (Supabase client clears it regardless).
        setUser(null);

        if (result.kind === 'failure') {
          setFailure(result);
        }

        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refreshUser = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setFailure(null);

    try {
      const result = await repoRef.current.getCurrentUser();

      if (result.kind === 'authenticated') {
        setUser(result.user);
      } else if (result.kind === 'unauthenticated') {
        setUser(null);
      } else {
        setFailure(result);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearFailure = useCallback((): void => {
    setFailure(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    // state
    user,
    isLoading,
    failure,
    isAuthenticated: user !== null,
    // actions
    signUp,
    signIn,
    signOut,
    refreshUser,
    clearFailure,
  };
}

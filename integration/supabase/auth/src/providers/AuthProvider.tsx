/**
 * AuthProvider Component
 * Provides authentication context to the entire app
 * Manages session state, login/register, and user data
 */

import React, { useEffect, useState, useCallback, ReactNode } from 'react';
import { AuthContext } from '@automatize/auth';
import { supabase } from '../client';
import { tokenStorage } from '../storage/tokenStorage';
import { loginSchema, registerSchema } from '../schemas/auth.schemas';
import { parseSupabaseError } from '../utils/errors';
import type {
  AuthUser,
  UserProfile,
  Tenant,
  AuthContextType,
} from '../types/auth.types';

export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 * Wraps the app and provides authentication context
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <AppNavigator />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({
  children,
}: AuthProviderProps): React.JSX.Element {
  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Restore session from stored tokens on app launch
   */
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to restore session from Supabase
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Failed to restore session:', sessionError);
        setIsAuthenticated(false);
        return;
      }

      if (data.session && data.session.user) {
        setUser(data.session.user);
        setIsAuthenticated(true);

        // Load user profile
        await loadUserProfile(data.session.user.id);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error restoring session:', err);
      setIsAuthenticated(false);
      setError('Failed to restore session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load user profile from database
   */
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Failed to load user profile:', profileError);
        return;
      }

      if (data) {
        setUserProfile(data as UserProfile);

        // Load default tenant if set
        if (data.default_tenant_id) {
          await loadTenant(data.default_tenant_id);
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  }, []);

  /**
   * Load tenant data
   */
  const loadTenant = useCallback(async (tenantId: string) => {
    try {
      const { data, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (tenantError) {
        console.error('Failed to load tenant:', tenantError);
        return;
      }

      if (data) {
        setCurrentTenant(data as Tenant);
      }
    } catch (err) {
      console.error('Error loading tenant:', err);
    }
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (
      email: string,
      password: string,
      mfaCode?: string
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate input
        const validation = loginSchema.safeParse({
          email,
          password,
          mfaCode,
        });

        if (!validation.success) {
          const fieldErrors = validation.error.flatten().fieldErrors;
          const firstError = Object.values(fieldErrors)[0]?.[0];
          throw new Error(firstError || 'Invalid login credentials');
        }

        // Attempt login
        const { data, error: loginError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (loginError) {
          throw parseSupabaseError(loginError);
        }

        if (!data.session || !data.user) {
          throw new Error('Login failed: No session returned');
        }

        // Check if MFA is required
        if (data.session.user.factors?.some((f) => f.status === 'verified')) {
          // MFA is enabled, may need to verify
          // In a real implementation, would handle MFA challenge here
        }

        // Store tokens
        const storage = tokenStorage();
        await storage.saveTokens({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in,
          userId: data.user.id,
        });

        // Update state
        setUser(data.user);
        setIsAuthenticated(true);

        // Load profile
        await loadUserProfile(data.user.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadUserProfile]
  );

  /**
   * Login with backup code (MFA alternative)
   */
  const loginWithBackupCode = useCallback(
    async (
      email: string,
      password: string,
      backupCode: string
    ): Promise<void> => {
      // First, do regular login
      await login(email, password);

      // Then verify with backup code
      // In production, would call the backup code verification API
      // For now, just acknowledge the backup code was used
      if (!backupCode) {
        throw new Error('Backup code is required');
      }
    },
    [login]
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName: string
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate input
        const validation = registerSchema.safeParse({
          email,
          password,
          passwordConfirm: password,
          displayName,
        });

        if (!validation.success) {
          const fieldErrors = validation.error.flatten().fieldErrors;
          const firstError = Object.values(fieldErrors)[0]?.[0];
          throw new Error(firstError || 'Validation failed');
        }

        // Attempt registration
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        });

        if (signUpError) {
          throw parseSupabaseError(signUpError);
        }

        if (!data.user) {
          throw new Error('Registration failed: No user created');
        }

        // Note: User profile and tenant are created automatically by database trigger
        // We don't need to create them here

        if (data.session) {
          // Store tokens if session is created
          const storage = tokenStorage();
          await storage.saveTokens({
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in,
            userId: data.user.id,
          });

          setUser(data.user);
          setIsAuthenticated(true);
          await loadUserProfile(data.user.id);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadUserProfile]
  );

  /**
   * Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Sign out from Supabase
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error('Supabase sign out error:', signOutError);
        // Don't throw - clear local state anyway
      }

      // Clear tokens
      const storage = tokenStorage();
      await storage.clearTokens();

      // Clear state
      setUser(null);
      setUserProfile(null);
      setCurrentTenant(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
      // Force clear state even if there was an error
      setUser(null);
      setUserProfile(null);
      setCurrentTenant(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password (send reset email)
   */
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email);

      if (resetError) {
        throw parseSupabaseError(resetError);
      }

      // Success - user should receive email
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to send reset email';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update password (for authenticated users)
   */
  const updatePassword = useCallback(
    async (newPassword: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          throw parseSupabaseError(updateError);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update password';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Switch tenant
   */
  const switchTenant = useCallback(
    async (tenantId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!user) {
          throw new Error('Not authenticated');
        }

        // Update default tenant
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ default_tenant_id: tenantId })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        // Load new tenant
        await loadTenant(tenantId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to switch tenant';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user, loadTenant]
  );

  /**
   * Create new tenant
   */
  const createTenant = useCallback(
    async (name: string): Promise<Tenant> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!user) {
          throw new Error('Not authenticated');
        }

        // Generate slug from name
        const slug = name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');

        // Create tenant
        const { data: tenantData, error: createError } = await supabase
          .from('tenants')
          .insert([{ name, slug }])
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        if (!tenantData) {
          throw new Error('Failed to create tenant');
        }

        // Add creator as admin
        const { error: memberError } = await supabase
          .from('tenant_members')
          .insert([
            {
              tenant_id: tenantData.id,
              user_id: user.id,
              role: 'admin',
            },
          ]);

        if (memberError) {
          throw memberError;
        }

        return tenantData as Tenant;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create tenant';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Listen for auth state changes
   */
  useEffect(() => {
    // Restore session on mount
    void restoreSession();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        setIsAuthenticated(true);
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setCurrentTenant(null);
        setIsAuthenticated(false);
        const storage = tokenStorage();
        await storage.clearTokens();
      } else if (event === 'USER_UPDATED' && session) {
        setUser(session.user);
      }
    });

    // Unsubscribe on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [restoreSession, loadUserProfile]);

  /**
   * Context value
   */
  const value: AuthContextType = {
    // State
    user,
    userProfile,
    currentTenant,
    isAuthenticated,
    isLoading,
    error,

    // Auth methods
    login,
    loginWithBackupCode,
    register,
    logout,
    resetPassword,
    updatePassword,

    // Tenant methods
    switchTenant,
    createTenant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

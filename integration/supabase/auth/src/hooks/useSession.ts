/**
 * useSession Hook
 * Manages session state and auto-refresh
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../client';
import { tokenStorage } from '../storage/tokenStorage';
import { shouldRefreshJWT, getJWTTimeRemaining } from '../utils/jwt';
import { useAuth } from './useAuth';

/**
 * useSession hook
 * Manages session auto-refresh and expiry
 * Should be used at the app root level
 *
 * @example
 * ```tsx
 * function App() {
 *   useSession();
 *   return <AppNavigator />;
 * }
 * ```
 */
export function useSession(): void {
  const { isAuthenticated } = useAuth();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  /**
   * Refresh access token
   */
  const refreshAccessToken = useCallback(async () => {
    if (isRefreshingRef.current || !isAuthenticated) return;

    isRefreshingRef.current = true;
    try {
      const storage = tokenStorage();
      const refreshToken = await storage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        console.error('Failed to refresh session:', error);
        // Session is invalid, force logout
        await supabase.auth.signOut();
        throw error;
      }

      if (data.session) {
        // Save new tokens
        await storage.saveTokens({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in,
        });
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      // Don't throw - let the user continue. They'll be kicked out when trying to make a request.
    } finally {
      isRefreshingRef.current = false;
    }
  }, [isAuthenticated]);

  /**
   * Schedule next refresh
   */
  const scheduleRefresh = useCallback(() => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    if (!isAuthenticated) return;

    // Get token expiry time
    const getTokenExpiry = async () => {
      try {
        const storage = tokenStorage();
        const accessToken = await storage.getAccessToken();
        if (!accessToken) return;

        const timeRemaining = getJWTTimeRemaining(accessToken);
        if (timeRemaining <= 0) {
          // Token already expired, refresh immediately
          await refreshAccessToken();
          return;
        }

        // Schedule refresh 5 minutes before expiry (or in 10 minutes, whichever is sooner)
        const refreshInSeconds = Math.max(300, timeRemaining - 300);
        refreshTimerRef.current = setTimeout(() => {
          void refreshAccessToken();
          scheduleRefresh(); // Schedule next refresh
        }, refreshInSeconds * 1000);
      } catch (error) {
        console.error('Error scheduling session refresh:', error);
      }
    };

    void getTokenExpiry();
  }, [isAuthenticated, refreshAccessToken]);

  /**
   * Set up session refresh on mount and when auth state changes
   */
  useEffect(() => {
    scheduleRefresh();

    // Clean up timer on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [scheduleRefresh]);

  /**
   * Listen for auth state changes
   */
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      const storage = tokenStorage();
      if (event === 'SIGNED_IN' && session) {
        // User signed in, save tokens and schedule refresh
        await storage.saveTokens({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in,
          userId: session.user.id,
        });
        scheduleRefresh();
      } else if (event === 'SIGNED_OUT') {
        // User signed out, clear tokens and refresh timer
        await storage.clearTokens();
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token was refreshed, save new tokens
        await storage.saveTokens({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in,
        });
        scheduleRefresh();
      }
    });

    // Unsubscribe on unmount
    return () => {
      data?.subscription?.unsubscribe();
    };
  }, [scheduleRefresh]);
}

/**
 * Get session time remaining
 * Useful for displaying session expiry warnings
 */
export async function getSessionTimeRemaining(): Promise<number | null> {
  try {
    const storage = tokenStorage();
    const accessToken = await storage.getAccessToken();
    if (!accessToken) return null;

    return getJWTTimeRemaining(accessToken);
  } catch {
    return null;
  }
}

/**
 * Check if current session needs refresh
 */
export async function shouldRefreshSession(): Promise<boolean> {
  try {
    const storage = tokenStorage();
    const accessToken = await storage.getAccessToken();
    if (!accessToken) return false;

    return shouldRefreshJWT(accessToken);
  } catch {
    return false;
  }
}

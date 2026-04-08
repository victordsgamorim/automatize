/**
 * Root Layout
 * Provides authentication context and route guards for the entire app
 */

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth, useIsAuthenticated } from '@automatize/supabase-auth';
import { RootErrorBoundary } from '@automatize/ui';
import {
  LocalizationProvider,
  initLocalization,
  createLocalLoader,
} from '@automatize/localization';
import {
  ThemeProvider,
  initTheme,
  createNativeStorageAdapter,
} from '@automatize/theme';
import { router } from 'expo-router';

// Start fetching translations immediately when the app module loads —
// before the React tree is mounted. Singleton guarantees this runs once
// per JS runtime session (i.e. once per app open).
initLocalization(createLocalLoader(), 'pt-BR');

// Start reading stored theme preference immediately.
initTheme({ storageAdapter: createNativeStorageAdapter() });

import { AuthProviderWrapper } from './auth-provider';

/**
 * Route guard logic
 * Redirects to auth routes if not authenticated
 */
function RootLayoutContent() {
  const isAuthenticated = useIsAuthenticated();
  const { isLoading } = useAuth();

  useEffect(() => {
    // Only redirect after auth check is complete
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated: go to login
        router.replace('/(auth)/login');
      } else {
        // Authenticated: go to app home
        router.replace('/(app)');
      }
    }
  }, [isAuthenticated, isLoading]);

  // Show nothing while checking auth state
  if (isLoading) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

/**
 * Root Layout component
 * Wraps entire app with error boundary and auth provider
 */
export default function RootLayout(): React.JSX.Element {
  return (
    <ThemeProvider>
      <LocalizationProvider>
        <RootErrorBoundary>
          <AuthProviderWrapper>
            <RootLayoutContent />
          </AuthProviderWrapper>
        </RootErrorBoundary>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

/**
 * Root Layout
 * Provides authentication context and route guards for the entire app
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth, useIsAuthenticated } from '@automatize/supabase-auth';
import { RootErrorBoundary } from '@automatize/ui';
import { router } from 'expo-router';
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
export default function RootLayout() {
  return (
    <RootErrorBoundary>
      <AuthProviderWrapper>
        <RootLayoutContent />
      </AuthProviderWrapper>
    </RootErrorBoundary>
  );
}

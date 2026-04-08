'use client';

/**
 * Auth Provider (Client Component)
 *
 * Wraps the app with the appropriate AuthProvider:
 * - USE_MOCK_AUTH = true  → MockAuthProvider (in-memory, no Supabase required)
 * - USE_MOCK_AUTH = false → Real AuthProvider backed by Supabase
 *
 * Dummy credentials (mock mode):
 *   email:    dev@automatize.local
 *   password: Dev@123456
 */

import React, { useEffect, useState } from 'react';
import {
  AuthProvider,
  MockAuthProvider,
  USE_MOCK_AUTH,
} from '@automatize/supabase-auth';
import { initializeAuthForWeb } from '@/lib/auth-init';

interface Props {
  children: React.ReactNode;
}

export function AuthProviderWrapper({ children }: Props): React.JSX.Element {
  // -------------------------------------------------------------------------
  // Mock mode — no initialization needed, render immediately
  // -------------------------------------------------------------------------
  if (USE_MOCK_AUTH) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  // -------------------------------------------------------------------------
  // Real Supabase mode
  // -------------------------------------------------------------------------
  return <RealAuthProviderWrapper>{children}</RealAuthProviderWrapper>;
}

/** Inner wrapper for the real Supabase auth flow (requires async init). */
function RealAuthProviderWrapper({ children }: Props) {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      initializeAuthForWeb();
      setIsAuthInitialized(true);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to initialize auth');
      setInitError(err);
      console.error('Auth initialization failed:', err);
    }
  }, []);

  if (initError) {
    return (
      <div style={{ padding: '20px', color: '#d32f2f' }}>
        <h1>Authentication Configuration Error</h1>
        <p>{initError.message}</p>
        <p>
          Check your environment variables: NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </p>
      </div>
    );
  }

  if (!isAuthInitialized) {
    return <div>Initializing authentication...</div>;
  }

  // Type cast needed due to React 18/19 type incompatibility between @automatize/supabase-auth and this app
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AuthProviderAny = AuthProvider as React.ComponentType<{
    children: React.ReactNode;
  }>;
  return <AuthProviderAny>{children}</AuthProviderAny>;
}

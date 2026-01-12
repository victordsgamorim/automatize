'use client';

/**
 * Auth Provider (Client Component)
 * Initializes auth and wraps the app with AuthProvider
 */

import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@automatize/auth';
import { initializeAuthForWeb } from '@/lib/auth-init';

interface Props {
  children: ReactNode;
}

export function AuthProviderWrapper({ children }: Props) {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      initializeAuthForWeb();
      setIsAuthInitialized(true);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to initialize auth');
      setInitError(err);
      console.error('Auth initialization failed:', err);
    }
  }, []);

  if (initError) {
    return (
      <div style={{ padding: '20px', color: '#d32f2f' }}>
        <h1>Authentication Configuration Error</h1>
        <p>{initError.message}</p>
        <p>Check your environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
      </div>
    );
  }

  if (!isAuthInitialized) {
    return <div>Initializing authentication...</div>;
  }

  return <AuthProvider>{children}</AuthProvider>;
}

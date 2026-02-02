/**
 * Auth Provider (Client Component)
 * Initializes auth and wraps the app with AuthProvider
 */

import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@automatize/auth';
import { initializeAuthForMobile } from '@/lib/auth-init';

interface Props {
  children: ReactNode;
}

export function AuthProviderWrapper({ children }: Props) {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      initializeAuthForMobile();
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
      <>
        <AuthProvider>{children}</AuthProvider>
      </>
    );
  }

  if (!isAuthInitialized) {
    return null;
  }

  return <AuthProvider>{children}</AuthProvider>;
}

import { useContext } from 'react';

import { AuthContext } from './context';
import type { AuthContextValue } from './types';

/**
 * Consume the shared auth context.
 *
 * Must be called inside a component tree wrapped by an AuthProvider
 * from @automatize/supabase-auth (or a compatible mock).
 *
 * @throws {Error} When called outside a tree wrapped by an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      'useAuth must be called inside a component tree wrapped by <AuthProvider>. ' +
        'Make sure @automatize/supabase-auth AuthProvider (or MockAuthProvider) ' +
        'is mounted above this component.'
    );
  }
  return ctx;
}

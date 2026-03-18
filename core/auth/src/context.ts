import { createContext } from 'react';

import type { AuthContextValue } from './types';

/**
 * Shared React context for authentication.
 *
 * Default is null — the app MUST be wrapped with an AuthProvider from
 * @automatize/supabase-auth (or a compatible mock) before this context
 * is consumed.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

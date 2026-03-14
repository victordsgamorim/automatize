import { createContext } from 'react';
import { AuthContextType } from '../types/auth.types';

/**
 * Shared Auth Context
 *
 * Defined in a standalone file to allow both the real AuthProvider
 * and the MockAuthProvider to share the same context object without
 * circular dependencies or importing the entire real AuthProvider
 * when mock mode is active.
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

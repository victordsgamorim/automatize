/**
 * AuthProviderFactory
 *
 * Selects the correct AuthProvider implementation based on the current
 * runtime mode:
 *
 *  - Debug / development  →  MockAuthProvider  (no Supabase, no network)
 *  - Production           →  AuthProvider      (real Supabase SDK)
 *
 * Detection order (first truthy value wins):
 *  1. `__DEV__`          — React Native / Expo global set by Metro bundler
 *  2. `process.env.NODE_ENV !== 'production'`  — Node / Next.js / Vite
 *
 * Usage (in your app entry point, e.g. `_layout.tsx` or `App.tsx`):
 *
 * ```tsx
 * import { AuthProviderFactory } from '@automatize/supabase-auth';
 *
 * export default function RootLayout({ children }) {
 *   return <AuthProviderFactory>{children}</AuthProviderFactory>;
 * }
 * ```
 *
 * The consuming component always reads from `useAuth()` — it never needs to
 * know which provider is active.
 */

import { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { MockAuthProvider } from '../mock/MockAuthProvider';

// ---------------------------------------------------------------------------
// Mode detection
// ---------------------------------------------------------------------------

// React Native / Expo Metro bundler injects `__DEV__` as a global boolean.
// Declare it here so TypeScript is happy without importing from react-native.
declare const __DEV__: boolean | undefined;

/**
 * Returns `true` when the app is running in debug / development mode.
 *
 * - React Native / Expo: uses the `__DEV__` global injected by Metro.
 * - Node / Next.js / Vite: falls back to `process.env.NODE_ENV`.
 */
function isDebugMode(): boolean {
  // React Native / Expo
  if (typeof __DEV__ !== 'undefined') {
    return __DEV__;
  }

  // Node / Next.js / Vite
  return (
    typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
  );
}

export const IS_DEBUG = isDebugMode();

// ---------------------------------------------------------------------------
// Factory component
// ---------------------------------------------------------------------------

export interface AuthProviderFactoryProps {
  children: ReactNode;
}

/**
 * Drop-in wrapper that auto-selects Mock vs Real AuthProvider.
 *
 * In debug mode a banner is logged to the console so the team always knows
 * they are running against mocked data — not a real Supabase project.
 */
export function AuthProviderFactory({ children }: AuthProviderFactoryProps) {
  if (IS_DEBUG) {
    console.warn(
      '🟡 [AuthProviderFactory] Running in DEBUG mode — ' +
        'using MockAuthProvider. No real Supabase calls will be made.'
    );
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  return <AuthProvider>{children}</AuthProvider>;
}

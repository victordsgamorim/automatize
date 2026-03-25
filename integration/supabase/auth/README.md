# @automatize/supabase-auth

Authentication and multi-tenancy library using Supabase.

## What is this?

Complete authentication system using Supabase Auth. Handles login, registration, password reset, MFA, session management, and workspace switching. This is the security layer that protects all data.

The public surface is intentionally minimal: **`useUserAuthentication`** is the only hook consumers should import. All internal details — the repository interface, data sources, factory, raw hooks, and Supabase client — are encapsulated inside the module and not exported.

The data layer is built around a provider-agnostic `AuthRepository` interface with two concrete implementations: `SupabaseAuthRemoteDataSource` (production) and `MockAuthDataSource` (local development). A factory function controls which one is active via the `USE_MOCK_AUTH` flag. Consumers never interact with these directly.

## How it works

**Authentication flows**: The library implements complete auth flows including registration, login, password reset, and logout. Each flow is validated with Zod schemas before touching the network.

**MFA support**: Users can enable TOTP-based two-factor authentication. The library handles enrollment, verification, and backup codes.

**Session management**: Tokens are automatically refreshed before expiring. The library tracks session state and handles logout when tokens expire.

**Multi-tenancy**: Users can belong to multiple workspaces (tenants). The library manages which tenant is active and includes the correct tenant_id in all requests.

**Secure storage**: On mobile, tokens are stored in the device Keychain/Keystore via expo-secure-store. On web, they're stored securely. Tokens are never in AsyncStorage.

**Mock mode**: When `USE_MOCK_AUTH` is `true`, all auth operations run in-memory with a pre-seeded dummy user. No Supabase project or environment variables are required. A `MockAuthProvider` replaces the real `AuthProvider` in the component tree — `useUserAuthentication` works identically in both modes.

## Why this way?

**Supabase as identity provider**: Supabase Auth is battle-tested, handles security properly, and integrates with the database. No need to build auth from scratch.

**JWT custom claims**: The JWT contains tenant_id, role, and permissions. Every API request carries this information, allowing the server to enforce access control.

**expo-secure-store**: Critical for mobile security. Tokens in regular storage can be extracted; Keychain/Keystore provides hardware-level protection.

**Refresh token rotation**: Tokens are short-lived (15 minutes) but refresh tokens last 7 days. This balances security with usability.

**Repository pattern**: `AuthRepository` decouples callers from the Supabase SDK. This makes the auth layer independently testable and allows the mock to be swapped in without changing any call sites.

**Single public hook**: Exposing one hook (`useUserAuthentication`) instead of raw hooks and classes keeps the API surface small and prevents consumers from accidentally depending on internals.

## Directory organization

```
src/
  adapters/     # Platform-specific storage implementations (web, mobile)
  data/         # Internal — domain model, repository interface, data sources
    user.model.ts                  # SupabaseUser immutable domain class + factory
    auth.repository.ts             # AuthRepository interface + result/event types
    supabase-auth.datasource.ts    # Production: Supabase SDK implementation
    mock-auth.datasource.ts        # Development: in-memory implementation
    auth.factory.ts                # USE_MOCK_AUTH flag + createAuthRepository()
  hooks/        # Internal — useAuth, useSession, useMFA, useTenant, useAuthRepository
    useUserAuthentication.ts       # PUBLIC: the only hook consumers should import
  providers/    # App-wide React Context
    AuthProvider.tsx               # PUBLIC: real Supabase-backed provider
    MockAuthProvider.tsx           # PUBLIC: in-memory provider for dev / tests
  schemas/      # Zod validation schemas for all auth forms
  storage/      # Token storage abstraction + secure storage adapters
  types/        # TypeScript definitions (AuthContextType, Tenant, UserProfile, …)
  utils/        # JWT parsing, error normalisation, PII redaction
```

## Public API

The following is the complete public surface of `@automatize/supabase-auth`.
Anything not listed here is internal and subject to change without notice.

### useUserAuthentication — the one hook to use

`src/hooks/useUserAuthentication.ts`

The single hook for all feature code. Encapsulates the repository, data
source, provider, and session details. Must be called inside a component tree
wrapped by `AuthProvider` or `MockAuthProvider`.

```ts
import { useUserAuthentication } from '@automatize/supabase-auth';

function LoginScreen() {
  const { login, isLoading, error } = useUserAuthentication();

  const handleSubmit = async (email: string, password: string) => {
    await login(email, password);
    // navigate to dashboard
  };
}

function Header() {
  const { user, isAuthenticated, logout } = useUserAuthentication();
  if (!isAuthenticated) return null;
  return <button onClick={logout}>{user?.email}</button>;
}
```

`UserAuthentication` interface:

| Field / Method                           | Type                  | Description                                  |
| ---------------------------------------- | --------------------- | -------------------------------------------- |
| `user`                                   | `AuthUser \| null`    | Currently authenticated user                 |
| `userProfile`                            | `UserProfile \| null` | Display name, default tenant, etc.           |
| `currentTenant`                          | `Tenant \| null`      | Active workspace                             |
| `isAuthenticated`                        | `boolean`             | `true` when a session is active              |
| `isLoading`                              | `boolean`             | `true` while any auth operation is in flight |
| `error`                                  | `string \| null`      | Last error message, `null` on success        |
| `login(email, password, mfaCode?)`       | `Promise<void>`       | Sign in; throws on failure                   |
| `logout()`                               | `Promise<void>`       | Sign out; always resolves                    |
| `register(email, password, displayName)` | `Promise<void>`       | Create account; throws on failure            |
| `resetPassword(email)`                   | `Promise<void>`       | Send password-reset email                    |
| `updatePassword(newPassword)`            | `Promise<void>`       | Change password (requires active session)    |

### AuthProvider — real Supabase provider

`src/providers/AuthProvider.tsx`

Used once in app bootstrap. Requires a configured Supabase project and
`initializeAuth` to have been called beforehand.

```tsx
import { AuthProvider } from '@automatize/supabase-auth';

function App() {
  return <AuthProvider>{/* app routes */}</AuthProvider>;
}
```

### MockAuthProvider — development / test provider

`src/providers/MockAuthProvider.tsx`

Drop-in replacement for `AuthProvider` when `USE_MOCK_AUTH` is `true`. Uses
the in-memory `MockAuthDataSource` internally — no Supabase project required.
Renders a fixed banner showing the active dummy credentials.

Pre-seeded dummy credentials:

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `dev@automatize.local` |
| Password | `Dev@123456`           |

```tsx
import { MockAuthProvider } from '@automatize/supabase-auth';

function App() {
  return <MockAuthProvider>{/* app routes */}</MockAuthProvider>;
}
```

### USE_MOCK_AUTH — feature flag

`src/data/auth.factory.ts`

Read by app bootstrap code to decide which provider to render. Never read
this in feature components — use `isAuthenticated` from `useUserAuthentication`
instead.

```ts
import { USE_MOCK_AUTH, AuthProvider, MockAuthProvider } from '@automatize/supabase-auth';

function AuthProviderWrapper({ children }) {
  if (USE_MOCK_AUTH) return <MockAuthProvider>{children}</MockAuthProvider>;
  return <AuthProvider>{children}</AuthProvider>;
}
```

To toggle: open `src/data/auth.factory.ts`, set `USE_MOCK_AUTH = true | false`,
then rebuild:

```bash
pnpm --filter @automatize/supabase-auth build
```

### Domain types

```ts
import type {
  AuthUser,
  UserProfile,
  Tenant,
  UserRole,
} from '@automatize/supabase-auth';
```

### Validation schemas

Zod schemas for use in feature forms (login, register, password reset, etc.):

```ts
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@automatize/supabase-auth';
```

### App initialisation (platform bootstrap only)

```ts
import {
  initializeAuth,
  isAuthConfigured,
  type AuthConfig,
} from '@automatize/supabase-auth';
```

---

## Internal data layer (not exported)

The following are internal implementation details. They are documented here
for contributors. **Do not import them from feature code.**

### SupabaseUser (domain model)

`src/data/user.model.ts`

Immutable data class representing an authenticated user. Constructed via the
`createSupabaseUser(source)` factory, which normalises all optional fields to
explicit `null`. The raw Supabase SDK `User` object is never exposed outside
this layer.

### AuthRepository (interface)

`src/data/auth.repository.ts`

Abstract contract for all auth data-access operations. All methods return
discriminated-union result types — implementations must never throw for
expected failures.

```ts
interface AuthRepository {
  signUp(email: string, password: string): Promise<SignUpResult>;
  signIn(email: string, password: string): Promise<SignInResult>;
  signOut(scope?: 'local' | 'global'): Promise<SignOutResult>;
  getCurrentUser(): Promise<GetCurrentUserResult>;
  onAuthStateChange(callback: AuthStateChangeCallback): AuthStateSubscription;
}
```

Result union types:

| Type                   | Variants                                                                      |
| ---------------------- | ----------------------------------------------------------------------------- |
| `SignUpResult`         | `AuthSuccess` \| `AuthPendingConfirmation` \| `AuthFailure`                   |
| `SignInResult`         | `AuthSuccess` \| `AuthFailure`                                                |
| `SignOutResult`        | `{ kind: 'success' }` \| `AuthFailure`                                        |
| `GetCurrentUserResult` | `{ kind: 'authenticated' }` \| `{ kind: 'unauthenticated' }` \| `AuthFailure` |

### SupabaseAuthRemoteDataSource (production)

`src/data/supabase-auth.datasource.ts`

Concrete `AuthRepository` backed by the Supabase JS SDK. Accepts a configured
`SupabaseClient` via its constructor. Never throws — all errors are returned
as `AuthFailure`. Instantiated internally by `createAuthRepository()`.

### MockAuthDataSource (development)

`src/data/mock-auth.datasource.ts`

In-memory `AuthRepository` with a pre-seeded user (`dev@automatize.local` /
`Dev@123456`). Fires `INITIAL_SESSION` immediately on subscription (mirrors
Supabase SDK behaviour). Instantiated internally by `createAuthRepository()`
when `USE_MOCK_AUTH` is `true`.

### createAuthRepository (factory)

`src/data/auth.factory.ts`

Returns `MockAuthDataSource` when `USE_MOCK_AUTH` is `true`, and
`SupabaseAuthRemoteDataSource` otherwise. Used internally by
`MockAuthProvider`. Not exported.

### useAuthRepository (hook)

`src/hooks/useAuthRepository.ts`

React hook that wraps an `AuthRepository` instance and manages local React
state. Used internally by the providers. Exposes `signIn`, `signUp`,
`signOut`, `refreshUser`, `isLoading`, `failure`, `user`. Not exported.

---

## Security principles

1. **Never store tokens in AsyncStorage** — Use expo-secure-store on mobile
2. **JWT claims include tenant isolation** — Every request carries tenant_id
3. **Least privilege** — RLS policies enforce data access at database level
4. **MFA enforced** — TOTP required for all users
5. **Mock mode is development-only** — `USE_MOCK_AUTH` must never be `true` in a production build
6. **Internal surface is not exported** — consumers cannot accidentally depend on implementation details

## Database schema

All tables follow the base entity pattern with:

- `id` — ULID primary key
- `tenant_id` — ULID for multi-tenancy isolation
- `created_at`, `updated_at` — Timestamps
- `deleted_at` — Soft delete (NULL = active)
- `version` — Optimistic locking

See `../docs/RLS_POLICIES.md` for database policies and templates.

## JWT structure

```json
{
  "sub": "user-id",
  "tenant_id": "current-workspace-id",
  "role": "admin | editor | viewer",
  "permissions": ["read", "write", "delete"],
  "exp": 1234567890,
  "iat": 1234567890
}
```

## MFA flow

1. User enables MFA in settings
2. Generate TOTP secret
3. User scans QR code with authenticator app
4. Verify initial code
5. Store backup codes securely
6. Subsequent logins require TOTP code

## Deep linking

The package supports deep links for:

- Password reset: `automatize://reset-password?token=xxx`
- Workspace invitation: `automatize://invite?token=xxx&tenant_id=xxx`
- Workspace switch: `automatize://switch-workspace?tenant_id=xxx`

See `../../docs/guides/DEEP_LINKING.md` for platform-specific setup.

## Design decisions

**Why TOTP for MFA?**
It's the most widely supported second factor. SMS is easier but less secure (SIM swapping attacks). Hardware keys are most secure but less accessible.

**Why not session cookies?**
Mobile apps don't handle cookies the same way. Token-based auth works consistently across all platforms.

**Why a repository interface instead of calling Supabase directly?**
It decouples callers from the SDK, enables the mock for development and testing, and makes the contract explicit at compile time via TypeScript discriminated unions.

**Why one public hook instead of many?**
A single `useUserAuthentication` hook keeps the API surface small, prevents feature code from reaching into internals, and makes the contract between the library and its consumers explicit and stable.

**Error handling**: All Supabase errors are parsed and transformed into user-friendly messages. Debug info is logged without PII.

## Current status

Fully implemented. Mock auth available for local development via `MockAuthProvider`.

## Related documentation

- `../docs/RLS_POLICIES.md` — Database security policies
- `../../docs/guides/DEEP_LINKING.md` — Deep link configuration

---

**Last Updated:** 2026-03-25

# @automatize/auth

Platform-agnostic authentication contract for Automatize.

## What is this?

A minimal, backend-agnostic package that defines the **authentication boundary** for the monorepo. It exports interfaces, a React context, a consumer hook, and the login validation schema — nothing else.

No implementation lives here. The concrete auth logic lives in `@automatize/supabase-auth`.

## Why this exists

Feature packages (e.g. `@automatize/sign-in`) need to call `login()` and read `isLoading`, but they must not depend on Supabase directly. `@automatize/auth` provides the minimum contract that both sides agree on:

- Feature packages consume `useAuth()` — they stay provider-agnostic
- `@automatize/supabase-auth` implements `AuthContextValue` and provides it via `<AuthProvider>`
- Swapping backends (Supabase → Firebase, etc.) requires changing only the integration layer

## Exports

```ts
import {
  AuthContext, // React context (default null — must be wrapped by a provider)
  useAuth, // Hook: throws if called outside <AuthProvider>
  loginSchema, // Zod schema: validates { email, password }
} from '@automatize/auth';
import type {
  AuthContextValue, // { isLoading: boolean; login(email, password): Promise<void> }
  LoginFormInput, // Inferred from loginSchema
} from '@automatize/auth';
```

## `AuthContextValue` interface

```ts
interface AuthContextValue {
  readonly isLoading: boolean;
  login(email: string, password: string): Promise<void>;
}
```

This is intentionally minimal — only what feature packages actually need. The full auth surface (session, user profile, logout, MFA, etc.) lives in `@automatize/supabase-auth`.

## `loginSchema`

Zod schema for the sign-in form:

```ts
const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});
```

Shared between the UI validation (client-side) and any server-side callers.

## Usage pattern

```tsx
// 1. Wrap your app with a compatible provider (from @automatize/supabase-auth)
import { AuthProvider } from '@automatize/supabase-auth';

<AuthProvider>
  <App />
</AuthProvider>;

// 2. Consume in any feature component
import { useAuth } from '@automatize/auth';

function LoginButton() {
  const { login, isLoading } = useAuth();
  // ...
}
```

## Rules

- This package contains **no implementation** and **no tests**
- It MUST NOT import from `@automatize/supabase-auth` or any backend SDK
- It MUST NOT import from any app (`apps/*`) or other feature package
- Adding new fields to `AuthContextValue` requires explicit justification — keep it minimal

---

**Last Updated:** 2026-03-25

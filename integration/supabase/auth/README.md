# @automatize/supabase-auth

Authentication and multi-tenancy library using Supabase.

## What is this?

Complete authentication system using Supabase Auth. Handles login, registration, password reset, MFA, session management, and workspace switching. This is the security layer that protects all data.

## How it works

**Authentication flows**: The library implements complete auth flows including registration, login, password reset, and logout. Each flow is validated with Zod schemas before touching the network.

**MFA support**: Users can enable TOTP-based two-factor authentication. The library handles enrollment, verification, and backup codes.

**Session management**: Tokens are automatically refreshed before expiring. The library tracks session state and handles logout when tokens expire.

**Multi-tenancy**: Users can belong to multiple workspaces (tenants). The library manages which tenant is active and includes the correct tenant_id in all requests.

**Secure storage**: On mobile, tokens are stored in the device Keychain/Keystore via expo-secure-store. On web, they're stored securely. Tokens are never in AsyncStorage.

## Why this way?

**Supabase as identity provider**: Supabase Auth is battle-tested, handles security properly, and integrates with the database. No need to build auth from scratch.

**JWT custom claims**: The JWT contains tenant_id, role, and permissions. Every API request carries this information, allowing the server to enforce access control.

**expo-secure-store**: Critical for mobile security. Tokens in regular storage can be extracted; Keychain/Keystore provides hardware-level protection.

**Refresh token rotation**: Tokens are short-lived (15 minutes) but refresh tokens last 7 days. This balances security with usability.

## Directory organization

- **adapters/** — Platform-specific storage implementations
- **hooks/** — React hooks for auth state
- **providers/** — React Context for app-wide auth
- **schemas/** — Zod validation for all auth forms
- **storage/** — Token storage abstraction
- **types/** — TypeScript definitions
- **utils/** — JWT parsing, error handling

## Security principles

1. **Never store tokens in AsyncStorage** — Use expo-secure-store on mobile
2. **JWT claims include tenant isolation** — Every request carries tenant_id
3. **Least privilege** — RLS policies enforce data access at database level
4. **MFA enforced** — TOTP required for all users

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

**Error handling**: All Supabase errors are parsed and transformed into user-friendly messages. Debug info is logged without PII.

## Current status

Fully implemented.

## Related documentation

- `../docs/RLS_POLICIES.md` — Database security policies
- `../../docs/guides/DEEP_LINKING.md` — Deep link configuration

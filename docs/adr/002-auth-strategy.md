# ADR-002: Authentication Strategy

**Date Created:** 2026-02-02
**Date Accepted:** 2026-02-02
**Status:** Accepted
**Deciders:** Development Team

---

## Context

The Automatize project requires a robust, secure authentication system that:

- Works across multiple platforms (mobile, web, desktop)
- Supports multi-tenancy with proper user isolation
- Enforces multi-factor authentication (MFA) for enhanced security
- Manages tokens securely without exposing sensitive data
- Handles session state reliably in offline scenarios
- Complies with LGPD/GDPR privacy requirements
- Provides a seamless user experience

We need a solution that:

- Leverages existing Supabase infrastructure
- Implements industry-standard JWT tokens
- Enforces MFA before granting access
- Stores credentials securely (never in AsyncStorage)
- Automatically refreshes expired tokens
- Handles edge cases (token expiry during offline, network failures, concurrent requests)

---

## Decision

We will implement authentication using **Supabase Auth with JWT tokens**, secured by **expo-secure-store** for token storage, and managed by **Zustand** for session state.

### Key Implementation Details

#### 1. Token Management

**Token Storage:**
- Access tokens and refresh tokens stored in **expo-secure-store** (Keychain on iOS, Keystore on Android, encrypted storage on Web)
- Never store tokens in AsyncStorage or React Context alone
- Token retrieval is async and non-blocking

```typescript
// Secure token storage
async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync('access_token', accessToken);
  await SecureStore.setItemAsync('refresh_token', refreshToken);
}

async function getAccessToken(): Promise<string | null> {
  return await SecureStore.getItemAsync('access_token');
}
```

**Token Format (JWT):**
- Standard JWT claims: `iss`, `sub`, `aud`, `exp`, `iat`, `nbf`
- Custom claims: `tenant_id` (ULID), `role` (admin|editor|viewer), `permissions` (array)
- Access token TTL: 15 minutes
- Refresh token TTL: 7 days
- Refresh tokens stored server-side with revocation capability

#### 2. Session Management

**Zustand Store:**
```typescript
interface AuthState {
  user: User | null;
  tenantId: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  setUser: (user: User) => void;
  setTenant: (tenantId: string) => void;
  logout: () => void;
  clearError: () => void;
}
```

**State Synchronization:**
- Session hydrated on app startup (from secure storage)
- State persists in Zustand (in-memory)
- Automatic re-sync on network reconnection
- Session invalidated on logout (all tokens cleared)

#### 3. Authentication Flow

**Login Flow:**
1. User enters email and password
2. **Frontend validation**: Email format + password strength (Zod)
3. **Supabase Auth**: POST `/auth/v1/token` with email/password
4. **Response**: JWT access token + refresh token (if MFA not required)
5. **MFA Check**: If `shouldEnableMFA` or `requiresMFA` flag set → MFA verification required
6. **Post-Login**: Store tokens securely, update Zustand state, redirect to dashboard/MFA setup

```typescript
async function login(email: string, password: string) {
  // Validate inputs
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePasswordStrength(password);

  if (!emailValidation.valid) throw new ValidationError('Invalid email');
  if (passwordValidation.score < 1) throw new ValidationError('Invalid password');

  // Call Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw new AuthError(error.message);

  // Check MFA requirement
  if (data.user?.user_metadata?.requiresMFA) {
    return { mfaRequired: true, sessionId: data.session?.id };
  }

  // Store tokens and update state
  await saveTokens(data.session.access_token, data.session.refresh_token);
  authStore.setUser(data.user);
  authStore.setTenant(data.user.user_metadata.tenant_id);
}
```

**Registration Flow:**
1. User enters email, password, full name
2. **Frontend validation**: All fields validated with Zod
3. **Supabase Auth**: POST `/auth/v1/signup` with email/password
4. **Auto-create profile**: Create user_profile record in WatermelonDB
5. **Auto-create tenant**: Create default tenant for new user
6. **Auto-setup MFA**: Recommend MFA setup (optional on signup, mandatory on next login)
7. **Email confirmation**: Send confirmation email (Supabase handles)
8. **Redirect**: Ask for email verification before allowing login

#### 4. Multi-Factor Authentication (MFA)

**MFA Strategy: TOTP (Time-based One-Time Password)**
- Standard: RFC 6238
- Backup codes: 10 single-use codes generated during setup
- Storage: `mfa_backup_codes` table in Supabase (encrypted)
- Enforcement: Required before accessing sensitive data

**MFA Setup Flow:**
1. User initiates MFA setup
2. **Generate Secret**: Supabase generates TOTP secret
3. **Display QR Code**: Show QR code for authenticator apps (Google Authenticator, Authy, Microsoft Authenticator)
4. **Verify**: User enters 6-digit code from authenticator app
5. **Generate Backup Codes**: 10 single-use backup codes
6. **Store Codes**: Encrypted in `mfa_backup_codes` table
7. **Enable MFA**: Set `requiresMFA = true` in user metadata

**TOTP Verification:**
```typescript
async function verifyMFA(userId: string, totp: string) {
  // Verify TOTP code (Supabase handles this)
  const { data, error } = await supabase.auth.verifyOtp({
    type: 'totp',
    token: totp
  });

  if (error) {
    // Try backup code if TOTP fails
    const backupValid = await verifyBackupCode(userId, totp);
    if (!backupValid) throw new MFAError('Invalid code');
  }

  // TOTP verified, issue JWT tokens
  return { accessToken, refreshToken };
}
```

**Backup Codes:**
- Each code can be used exactly once (marked as `used` in DB)
- Codes should only be shown once during setup (not retrievable later)
- User advised to save codes in secure location (printed, password manager, etc.)

#### 5. Token Refresh

**Automatic Refresh:**
- Refresh happens before token expiry (at 14 minutes, before 15-min expiry)
- Non-blocking background operation
- Uses refresh token (never sends access token to refresh endpoint)

```typescript
async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new AuthError('No refresh token available');

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken
  });

  if (error) {
    // Refresh token expired or revoked
    authStore.logout();
    throw new AuthError('Session expired, please login again');
  }

  // Store new tokens
  await saveTokens(data.session.access_token, data.session.refresh_token);
}
```

**Refresh on Network Recovery:**
- Monitor network state via NetInfo
- When connection recovers, immediately refresh tokens
- Prevents stale tokens when returning from offline

#### 6. Logout

**Logout Flow:**
1. **Clear Local Tokens**: Remove from secure storage
2. **Clear State**: Reset Zustand auth store
3. **Invalidate Session**: POST `/auth/v1/logout` to Supabase
4. **Clear Cache**: Clear TanStack Query cache
5. **Clear DB**: Optionally wipe WatermelonDB (user preference)
6. **Redirect**: Navigate to login screen

```typescript
async function logout() {
  // Clear tokens
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');

  // Clear state
  authStore.logout();

  // Invalidate server session
  await supabase.auth.signOut();

  // Clear query cache
  queryClient.clear();

  // Clear local DB (optional)
  // await database.unsafeResetDatabase();

  // Redirect to login
  router.replace('/(auth)/login');
}
```

#### 7. Password Reset

**Reset Flow:**
1. User enters email
2. **Supabase**: Sends reset email with signed link
3. **Link Format**: `https://app.com/reset-password?token=TOKEN&type=recovery`
4. **Deep Link**: Mobile/desktop apps handle via deep linking
5. **Token Verification**: Frontend validates token hasn't expired
6. **New Password**: User enters new password (validated with Zod)
7. **Supabase**: Update password with reset token
8. **Redirect**: Auto-login with new credentials or prompt for login

```typescript
async function resetPassword(token: string, newPassword: string) {
  // Validate token format and expiry (Supabase handles expiry)
  if (!token || token.length === 0) throw new ValidationError('Invalid token');

  // Validate new password
  const validation = validatePasswordStrength(newPassword);
  if (!validation.isStrong) {
    throw new ValidationError(`Password too weak: ${validation.feedback.join(', ')}`);
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw new AuthError(error.message);

  // Redirect to login
  router.replace('/(auth)/login');
}
```

#### 8. Session Validation

**On App Start:**
1. Check if tokens exist in secure storage
2. If tokens exist, attempt to refresh (in case they expired offline)
3. If refresh succeeds, hydrate auth state
4. If refresh fails, clear session and require login
5. Validate JWT claims (`tenant_id`, `role`, `permissions`)

```typescript
async function initializeAuth() {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      authStore.setAuthenticated(false);
      return;
    }

    // Attempt refresh to get fresh token
    await refreshAccessToken();

    // Fetch user profile
    const { data: user } = await supabase.auth.getUser();
    authStore.setUser(user);
    authStore.setTenant(user.user_metadata.tenant_id);
    authStore.setAuthenticated(true);
  } catch (error) {
    // Token invalid or expired, require re-login
    authStore.logout();
  }
}
```

#### 9. Concurrent Request Handling

**Problem:** Multiple requests happen during token refresh, all see expired token

**Solution:** Queue requests during refresh
```typescript
let refreshPromise: Promise<void> | null = null;

async function getValidAccessToken() {
  let token = await getAccessToken();

  if (isTokenExpired(token)) {
    // Only refresh once, other requests wait for result
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken()
        .finally(() => { refreshPromise = null; });
    }
    await refreshPromise;
    token = await getAccessToken();
  }

  return token;
}
```

#### 10. Security Headers & CSRF Protection

**HTTP Client Configuration:**
```typescript
const fetcher = ky.create({
  prefixUrl: API_URL,
  retry: 3,
  timeout: 10000,
  hooks: {
    beforeRequest: [
      async (request) => {
        // Add Authorization header with access token
        const token = await getValidAccessToken();
        request.headers.set('Authorization', `Bearer ${token}`);
        return request;
      }
    ],
    afterResponse: [
      async (response) => {
        // Handle 401 (token expired/invalid) by refreshing
        if (response.status === 401) {
          await refreshAccessToken();
          // Retry request with new token
          const token = await getAccessToken();
          response.request.headers.set('Authorization', `Bearer ${token}`);
          return ky(response.request);
        }
        return response;
      }
    ]
  }
});
```

---

## Consequences

### Positive

- **Industry Standard**: JWT + TOTP are battle-tested, widely adopted
- **Supabase Native**: Leverages Supabase Auth, no additional infrastructure
- **Secure Storage**: Tokens never in AsyncStorage, protected by OS Keychain/Keystore
- **MFA Enforcement**: TOTP provides strong second factor, backup codes provide recovery
- **Offline Support**: Tokens persist locally, refresh happens on network recovery
- **Zero Trust**: RLS policies on Supabase validate tenant_id, server never trusts client claims
- **Compliance Ready**: No PII in logs, secure token rotation, audit trail via Supabase
- **Type Safe**: Zod validation ensures inputs are correct before sending to server

### Negative

- **Complexity**: Token refresh, MFA setup, backup code management add complexity
- **Token Expiry Edge Cases**: Logout during offline, token refresh races, concurrent requests need careful handling
- **TOTP Dependency**: Users must install authenticator app (solved with backup codes)
- **No Session Revocation**: Refresh token revocation takes time to propagate (mitigated by short access token TTL)
- **Mobile Platform Limits**: Secure storage on Web is less robust than iOS/Android (encrypted but not hardware-backed)

### Neutral

- **Password Reset UX**: Requires email access (standard, unavoidable)
- **No Passwordless Auth**: Not implementing magic links or social login (future decision)

---

## Alternatives Considered

### Alternative 1: Session-Based Authentication (Cookies + Session Store)

- **Pros**: Simpler flow, automatic cleanup, built-in CSRF protection
- **Cons**: Not suitable for mobile, stateful server requirement, harder to scale
- **Rejected**: Mobile apps don't use cookies natively, offline-first incompatible

### Alternative 2: OAuth 2.0 + Social Login (Google, GitHub)

- **Pros**: No password management, faster onboarding
- **Cons**: Requires OAuth provider infrastructure, fallback for users without social account, privacy concerns
- **Rejected**: Not a requirement for Phase 1, can be added later as enhancement

### Alternative 3: Passwordless Auth (Magic Links / TOTP Email)

- **Pros**: No password reset, reduced attack surface
- **Cons**: Email dependency (user must have reliable email), slower UX, no password for critical operations
- **Rejected**: Email links are subject to interception, TOTP email is less secure than app-based

### Alternative 4: Store Tokens in Redux/Zustand Context

- **Pros**: Simpler to implement, persistent state
- **Cons**: Tokens exposed in memory, at risk during app suspension/backgrounding, violates security baseline
- **Rejected**: Violates Client Security Baseline (CLAUDE.md section "Secure Storage")

---

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT.io - JSON Web Tokens](https://jwt.io/)
- [RFC 6238 - TOTP Algorithm](https://tools.ietf.org/html/rfc6238)
- [expo-secure-store Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [ADR-001: Monorepo with Turborepo](./001-monorepo-with-turborepo.md)

---

## Notes

- This decision was made in Phase 1 (Authentication & Multi-tenancy)
- MFA enforcement timeline: Optional on signup, mandatory by next login (configurable)
- Token refresh can be made less aggressive if network conditions improve (currently 14-min check)
- Passwordless auth (magic links) can be reconsidered if user feedback indicates friction with password resets
- Social login integration (OAuth) can be added in Phase 2 as a convenience feature
- Session revocation (token blacklist) may be needed if compromised token discovered (not in MVP)

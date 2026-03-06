# Deep Linking Configuration Guide

Deep linking allows external URLs to directly open specific screens in the Automatize app. This guide covers password reset flows, workspace invitations, and workspace switching.

---

## Overview

**Deep Link Scheme:** `automatize://`

### Supported Deep Link Routes

| Route               | Purpose                        | Example                                                              |
| ------------------- | ------------------------------ | -------------------------------------------------------------------- |
| `/reset-password`   | Password reset from email link | `automatize://reset-password?token=abc123`                           |
| `/invite`           | Join workspace via invitation  | `automatize://invite?id=xyz789&email=user@example.com`               |
| `/switch-workspace` | Switch to another workspace    | `automatize://switch-workspace?tenant_id=01ARZ3NDEKTSV4RRFFQ69G5FAV` |

---

## Platform-Specific Setup

### iOS

**Bundle Identifier:** `com.automatize.app`

**URL Scheme Registration:**

- Already configured in `apps/mobile/app.json` with `"scheme": "automatize"`
- Supabase Auth will automatically resolve `automatize://reset-password?token=X` to the app

**Associated Domains (Optional for Email Link Handling):**

```json
{
  "ios": {
    "associatedDomains": [
      "applinks:automatize.com",
      "applinks:*.automatize.com"
    ]
  }
}
```

### Android

**Package Name:** `com.automatize.app`

**Intent Filter Configuration:**

- Already configured in `apps/mobile/app.json` with `"scheme": "automatize"`
- Deep links are automatically registered with Expo Router

**App Links (Optional for Better UX):**

```json
{
  "android": {
    "intentFilters": [
      {
        "action": "android.intent.action.VIEW",
        "data": [
          {
            "scheme": "https",
            "host": "automatize.app",
            "pathPrefix": "/auth"
          }
        ],
        "category": [
          "android.intent.category.BROWSABLE",
          "android.intent.category.DEFAULT"
        ]
      }
    ]
  }
}
```

### Web

**Redirect URLs:** `http://localhost:3000` (dev) and `https://automatize.app` (prod)

Web uses standard HTTP redirects, not deep links. Routing handled by Next.js/Expo Router web adapter.

---

## Supabase Auth Configuration

### 1. Password Reset Email Link

**Supabase Console → Authentication → Email Templates → Reset Password Email**

**Email Template (Liquid):**

```
Click the link below to reset your password:

{{ reset_link }}

Or copy and paste this link in your browser:
{{ reset_link_secure }}
```

**Supabase will generate links in format:**

- Mobile: `automatize://reset-password?token=YOUR_TOKEN&type=recovery`
- Web: `https://automatize.app/auth/reset-password?token=YOUR_TOKEN&type=recovery`

### 2. Email Confirmation Link

**Supabase Console → Authentication → Email Templates → Confirm Signup Email**

Already configured, but ensure redirect is set correctly.

### 3. Redirect URLs Configuration

**Supabase Console → Authentication → URL Configuration**

**Add these redirect URLs:**

```
# Development
http://localhost:3000
http://localhost:3000/auth/callback
automatize://reset-password
automatize://invite
automatize://switch-workspace

# Production
https://automatize.app
https://automatize.app/auth/callback
automatize://reset-password
automatize://invite
automatize://switch-workspace

# Staging (if applicable)
https://staging.automatize.app
https://staging.automatize.app/auth/callback
```

**Custom Redirect (Recommended):**

Go to **Supabase Console → Authentication → Email Templates → Reset Password Email** and set the redirect URL:

```
[Reset Password]({{ .ConfirmationURL }})
```

Where the confirmation URL will be:

- Mobile: `automatize://reset-password?token=TOKEN`
- Web: `https://automatize.app/auth/reset-password?token=TOKEN`

---

## Environment Variables

### .env.development (Mobile)

```env
EXPO_PUBLIC_SUPABASE_URL=https://gyxxlwmqlkjqvfkceeev.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_vjqgII4dybd0zj1cL5vgYg_DkvkqVE-
EXPO_PUBLIC_APP_SCHEME=automatize://
```

### .env.production (Mobile)

```env
EXPO_PUBLIC_SUPABASE_URL=https://gyxxlwmqlkjqvfkceeev.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_vjqgII4dybd0zj1cL5vgYg_DkvkqVE-
EXPO_PUBLIC_APP_SCHEME=automatize://
```

### .env.production (Web)

```env
NEXT_PUBLIC_SUPABASE_URL=https://gyxxlwmqlkjqvfkceeev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_vjqgII4dybd0zj1cL5vgYg_DkvkqVE-
NEXT_PUBLIC_APP_URL=https://automatize.app
```

---

## Deep Link Routes and Handlers

### Route 1: Password Reset (`/reset-password`)

**File:** [apps/mobile/app/(auth)/reset-password.tsx](<../../apps/mobile/app/(auth)/reset-password.tsx>)

**URL Scheme:**

```
automatize://reset-password?token=abc123def456
```

**Expected Query Parameters:**

- `token` (string, required): Supabase reset token from email link

**Handler Logic:**

1. Extract `token` from URL params using `useLocalSearchParams()`
2. Display password reset form
3. User enters new password (validated with Zod)
4. Call `supabase.auth.updateUser({ password: newPassword })`
5. On success, navigate to login screen

**User Flow:**

1. User receives password reset email from Supabase
2. Email contains link: `automatize://reset-password?token=X`
3. User clicks link → App opens at reset password screen
4. User enters new password → Submit
5. Password updated in Supabase Auth
6. Redirect to login screen

### Route 2: Workspace Invitation (`/invite`)

**File:** (To be created at [apps/mobile/app/(auth)/invite.tsx](<../../apps/mobile/app/(auth)/invite.tsx>))

**URL Scheme:**

```
automatize://invite?id=abc123&email=user@example.com
```

**Expected Query Parameters:**

- `id` (string, required): Invitation ID (ULID)
- `email` (string, required): User's email address
- `code` (string, optional): Alternative to `id` (for URL-safe codes)

**Handler Logic:**

1. Extract invitation ID and email from params
2. If user is NOT authenticated:
   - Show signup form pre-filled with email
   - After signup, automatically apply invitation
3. If user IS authenticated:
   - Check if email matches authenticated user
   - If different, logout and show signup with invitation email
   - Apply invitation to tenant
4. Redirect to dashboard/workspace

**User Flow:**

1. Admin sends workspace invitation email
2. Email contains link: `automatize://invite?id=XYZ&email=user@example.com`
3. User clicks link
4. If not signed up: Show signup form pre-filled with email
5. User creates account → Invitation automatically applied
6. User added to workspace with invited role
7. Redirect to workspace dashboard

**Implementation Notes:**

- Never require second signup if already signed in
- If email doesn't match authenticated user, prompt logout first
- Invitation expires after 7 days
- Handle expired invitation gracefully

### Route 3: Workspace Switching (`/switch-workspace`)

**File:** (Handle in [apps/mobile/app/(app)/tenants.tsx](<../../apps/mobile/app/(app)/tenants.tsx>) or modal)

**URL Scheme:**

```
automatize://switch-workspace?tenant_id=01ARZ3NDEKTSV4RRFFQ69G5FAV
```

**Expected Query Parameters:**

- `tenant_id` (string, required): Workspace ID (ULID)

**Handler Logic:**

1. Verify user is authenticated (if not, redirect to login)
2. Fetch user's accessible tenants
3. Verify tenant_id is in list of accessible tenants
4. Call `switchWorkspace(tenant_id)` (via auth service)
5. Clear query cache (new tenant = different data)
6. Redirect to workspace dashboard

**User Flow:**

1. User receives "shared workspace" link (internal or email)
2. Link format: `automatize://switch-workspace?tenant_id=ABC123`
3. User clicks link → Opens workspace directly
4. Auth state updated with new workspace context
5. All data resynced for new workspace
6. Redirect to workspace home

---

## Testing Deep Links

### iOS (Simulator)

**Method 1: Using `xcrun`**

```bash
xcrun simctl openurl booted "automatize://reset-password?token=test123"
```

**Method 2: Using Safari in Simulator**

1. Open Safari in iOS Simulator
2. Enter URL: `automatize://reset-password?token=test123`
3. Press Go → App opens at reset password screen

**Method 3: Using Expo CLI**

```bash
expo send --url "automatize://reset-password?token=test123" --ios
```

### Android (Emulator)

**Method 1: Using `adb`**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "automatize://reset-password?token=test123" com.automatize.app
```

**Method 2: Using Chrome**

1. Open Chrome in Android Emulator
2. Enter URL: `automatize://reset-password?token=test123`
3. Press Go → App opens at reset password screen

**Method 3: Using Expo CLI**

```bash
expo send --url "automatize://reset-password?token=test123" --android
```

### Web

**Method 1: Direct Navigation**

```typescript
router.push('/(auth)/reset-password?token=test123');
```

**Method 2: From Browser**

```
http://localhost:3000/auth/reset-password?token=test123
```

### Manual Testing Checklist

- [ ] Test password reset link (copy from Supabase test email)
- [ ] Test invitation link (copy from invitation email)
- [ ] Test workspace switching (manually constructed URL)
- [ ] Verify deep link opens app if not running
- [ ] Verify deep link navigates to correct screen if app is running
- [ ] Test deep link with invalid/expired token (should show error)
- [ ] Test deep link with multiple users (correct tenant isolation)
- [ ] Test on both iOS and Android
- [ ] Test on physical devices (not just simulators)

---

## Handling Deep Links in Code

### Example: Custom Deep Link Handler

If you need to handle deep links before reaching the route:

```typescript
// apps/mobile/app/_layout.tsx

import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useAuth } from '@automatize/supabase-auth';

const linking = {
  prefixes: ['automatize://', 'https://automatize.app'],
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }
    return undefined;
  },
  subscribe(listener: (url: string) => void) {
    const onReceiveURL = ({ url }: { url: string }) => {
      listener(url);
    };

    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      subscription.remove();
    };
  },
  getStateFromPath: (path: string) => {
    return {
      screens: {
        '(auth)/reset-password': {
          pattern: '/reset-password',
          parse: {
            token: (token: string) => decodeURIComponent(token),
          },
        },
        '(auth)/invite': {
          pattern: '/invite',
          parse: {
            id: (id: string) => decodeURIComponent(id),
            email: (email: string) => decodeURIComponent(email),
          },
        },
      },
    };
  },
};

export default function RootLayout() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Handle initial deep link after auth state is loaded
      Linking.getInitialURL().then((url) => {
        if (url != null) {
          // Route will be handled by Expo Router automatically
        }
      });
    }
  }, [isLoading]);

  return <RootLayoutContent />;
}
```

---

## URL Encoding

Always URL-encode special characters in deep link parameters:

```typescript
// Correct
const token = 'abc+def=='; // JWT with special chars
const encoded = encodeURIComponent(token); // "abc%2Bdef%3D%3D"
const url = `automatize://reset-password?token=${encoded}`;

// When received, decode
const { token } = useLocalSearchParams<{ token: string }>();
const decoded = decodeURIComponent(token); // "abc+def=="
```

---

## Troubleshooting

### Deep Link Not Opening App

1. **Check URL Scheme:** Ensure `"scheme": "automatize"` is in `app.json`
2. **Check Redirect URLs:** Verify `automatize://reset-password` is in Supabase Auth configuration
3. **App Not Running:** Rebuild app with `expo prebuild` or `eas build`
4. **Simulator/Emulator:** Restart simulator and clear app cache

**Clear cache:**

```bash
# iOS
expo run:ios --clean

# Android
expo run:android --clean
```

### Deep Link Not Passing Parameters

1. **Check URL Encoding:** Verify special characters are encoded
2. **Check Route Name:** Ensure route file matches deep link path
3. **Check Query Params:** Verify `useLocalSearchParams()` is in correct screen

### Workspace Switching Not Working

1. **Check Token Validity:** Ensure JWT token is still valid (not expired)
2. **Check Tenant Access:** Verify user has access to target tenant via `tenant_members` table
3. **Check RLS Policies:** Ensure RLS policies allow switching (must read user's tenant list)
4. **Clear Cache:** Clear query cache before switching: `queryClient.clear()`

---

## Security Considerations

### Token Exposure

**Problem:** Reset tokens in URLs are logged/visible

**Mitigation:**

- Use short-lived tokens (15-30 min expiry)
- Tokens single-use (used after reset)
- Tokens are server-signed, user cannot forge
- HTTPS only (Supabase enforces)
- Never log tokens in error messages

### Email Interception

**Problem:** Reset email intercepted during transit

**Mitigation:**

- HTTPS for email delivery (Supabase uses TLS)
- User must verify token validity (not auto-reset)
- User sees token in URL before submitting
- Multi-factor authentication recommended

### Tenant Isolation

**Problem:** User tries to switch to unauthorized tenant

**Mitigation:**

- RLS policy validates user's `tenant_members` record
- Edge Function verifies membership before issuing JWT
- Client-side verification as defense-in-depth
- Audit logs in Supabase track all workspace switches

---

## Related Documentation

- [ADR-002: Authentication Strategy](../adr/002-auth-strategy.md)
- [ADR-003: Multi-Tenancy Strategy](../adr/003-multi-tenancy-strategy.md)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Expo Router Deep Linking](https://expo.github.io/router/deep-linking)

---

## Checklist: Ready for Production

- [ ] All deep link URLs configured in Supabase Auth
- [ ] All environment variables set for production
- [ ] Email templates verified (reset and confirmation links correct)
- [ ] Deep links tested on iOS physical device
- [ ] Deep links tested on Android physical device
- [ ] Deep links tested on Web
- [ ] Token expiry handled gracefully
- [ ] Invalid tokens show helpful error message
- [ ] Security audit completed

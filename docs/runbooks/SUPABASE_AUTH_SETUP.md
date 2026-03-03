# Supabase Auth Setup Runbook

This runbook provides step-by-step instructions for configuring Supabase Auth for the Automatize project, including email templates, redirect URLs, and MFA settings.

---

## Prerequisites

- Access to Supabase project dashboard
- Project already created with migrations applied
- RLS policies in place
- Email service configured (Supabase default or custom SMTP)

---

## Part 1: Redirect URL Configuration

### Step 1: Navigate to Auth Settings

1. Go to **Supabase Console** → Your Project
2. Click **Authentication** in the left sidebar
3. Click **URL Configuration** (under "Settings")

### Step 2: Add Redirect URLs

Add the following redirect URLs (update domains as needed):

```
Development:
http://localhost:3000
http://localhost:3000/auth/callback
automatize://reset-password
automatize://invite
automatize://switch-workspace

Staging:
https://staging.automatize.app
https://staging.automatize.app/auth/callback
automatize://reset-password
automatize://invite
automatize://switch-workspace

Production:
https://automatize.app
https://automatize.app/auth/callback
automatize://reset-password
automatize://invite
automatize://switch-workspace
```

**Why Multiple URLs?**

- Web app needs HTTP/HTTPS redirects
- Mobile app needs deep link URLs
- Development, staging, and production have different domains
- Each stage needs its own set of URLs

### Step 3: Add Site URL

Under **Site URL**, set:

**Development:**

```
http://localhost:3000
```

**Production:**

```
https://automatize.app
```

This is the base URL for email links and redirects.

---

## Part 2: Email Templates Configuration

### Step 1: Navigate to Email Templates

1. Click **Authentication** → **Email Templates** (under "Settings")

### Step 2: Configure Reset Password Email

**Template Name:** Reset Password

1. Click **Edit** next to "Reset Password Email"
2. Set **Subject:**

   ```
   Reset your Automatize password
   ```

3. Set **Body** (HTML):

   ```html
   <p>Hi {{ .Email }},</p>

   <p>Click the link below to reset your password:</p>

   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>

   <p>Or copy and paste this link in your browser:</p>
   <p>{{ .ConfirmationURL }}</p>

   <p>This link expires in 24 hours.</p>

   <hr />

   <p>If you didn't request this, you can safely ignore this email.</p>

   <p>— Automatize Team</p>
   ```

4. Click **Save**

**Note:** Supabase automatically generates `{{ .ConfirmationURL }}` based on your Site URL:

- For mobile: `automatize://reset-password?token=TOKEN`
- For web: `https://automatize.app/auth/reset-password?token=TOKEN`

### Step 3: Configure Confirmation Email

**Template Name:** Confirm signup

1. Click **Edit** next to "Confirm signup email"
2. Set **Subject:**

   ```
   Confirm your Automatize account
   ```

3. Set **Body**:

   ```html
   <p>Hi {{ .Email }},</p>

   <p>Click the link below to confirm your email address:</p>

   <p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>

   <p>Or copy and paste this link in your browser:</p>
   <p>{{ .ConfirmationURL }}</p>

   <p>This link expires in 24 hours.</p>

   <hr />

   <p>If you didn't create this account, you can safely ignore this email.</p>

   <p>— Automatize Team</p>
   ```

4. Click **Save**

### Step 4: Configure Invite Email (if using built-in invites)

**Template Name:** Invite (optional, only if using Supabase invite feature)

1. Click **Edit** next to "Invite email"
2. Set **Subject:**

   ```
   You've been invited to Automatize
   ```

3. Set **Body**:

   ```html
   <p>Hi {{ .Email }},</p>

   <p>You've been invited to join a workspace on Automatize.</p>

   <p><a href="{{ .ConfirmationURL }}">Accept Invitation</a></p>

   <p>Or copy and paste this link in your browser:</p>
   <p>{{ .ConfirmationURL }}</p>

   <p>This link expires in 7 days.</p>

   <hr />

   <p>
     If you didn't expect this invitation, you can safely ignore this email.
   </p>

   <p>— Automatize Team</p>
   ```

4. Click **Save**

---

## Part 3: SMTP Configuration (Optional)

By default, Supabase uses its own email service. If you want to use a custom SMTP provider (SendGrid, AWS SES, etc.):

### Step 1: Navigate to SMTP Settings

1. Click **Authentication** → **Email Templates** → **SMTP Settings**

### Step 2: Configure SMTP

Fill in the following details (example for SendGrid):

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: SG.xxxxx_your_sendgrid_api_key
From Email Address: noreply@automatize.app
From Name: Automatize
```

### Step 3: Test SMTP Connection

1. Click **Test Connection**
2. Verify the connection succeeds
3. A test email will be sent to your account

**Note:** Custom SMTP is optional. Supabase's default service is suitable for most applications.

---

## Part 4: Multi-Factor Authentication (MFA) Setup

### Step 1: Navigate to MFA Settings

1. Click **Authentication** → **MFA (Multi-Factor Authentication)**

### Step 2: Enable TOTP

1. Toggle **TOTP (Time-based One-Time Password)** to **Enabled**
2. Set **Issuer Name:** `Automatize`
3. Set **Window Leeway:** `1` (allows 1 window before/after for clock skew)

This enables users to set up authenticator apps during signup.

### Step 3: Enable Phone/SMS (Optional)

If you want SMS-based MFA:

1. Toggle **SMS** to **Enabled**
2. Configure phone OTP provider (Twilio, AWS SNS, etc.)
3. Set **OTP Expiry Duration:** `300` (5 minutes)

**Note:** For MVP, TOTP is sufficient. SMS can be added later.

---

## Part 5: Custom Claims in JWT

### Step 1: Navigate to JWT Settings

1. Click **Authentication** → **JWT Settings** (under "Settings")

### Step 2: Set JWT Secret

**Do NOT change** the auto-generated JWT secret. This is used to sign tokens.

**To view secret:**

1. Click **Reveal secret**
2. Copy the secret (keep confidential!)

### Step 3: Custom Claims Configuration

Custom claims are added via **Auth Hooks** (Edge Functions) or **Database Triggers**.

For Automatize, we add custom claims via Edge Function:

**File:** `packages/integration/supabase/functions/update-jwt-claims/index.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function updateJWTClaims(userId: string, tenantId: string) {
  // Fetch user's role in tenant
  const { data: member } = await supabaseAdmin
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .single();

  // Generate new JWT with custom claims
  const token = supabaseAdmin.auth.admin.issueSessionToken(userId, {
    custom_claims: {
      tenant_id: tenantId,
      role: member?.role || 'viewer',
      permissions: getPermissions(member?.role || 'viewer'),
    },
  });

  return token;
}

function getPermissions(role: string): string[] {
  const permissions = {
    admin: ['*'],
    editor: ['invoices:*', 'clients:*', 'products:*', 'analytics:read'],
    viewer: [
      'invoices:read',
      'clients:read',
      'products:read',
      'analytics:read',
    ],
  };
  return permissions[role] || [];
}
```

---

## Part 6: Security Settings

### Step 1: Password Requirements

1. Click **Authentication** → **Providers → Email**
2. Under **Password Requirements**, set:
   - **Minimum Length:** `8`
   - **Enable password requirements:** Toggle **ON**

### Step 2: Auto-Confirm Users (Development Only)

**⚠️ DO NOT ENABLE IN PRODUCTION**

For development, you may want to auto-confirm users:

1. Click **Authentication** → **Providers → Email**
2. Toggle **Confirm email** to **OFF** (auto-confirms)

**Production:** Leave enabled (users must confirm email)

### Step 3: Session Settings

1. Click **Authentication** → **Security**
2. Set **JWT Expiry:** `3600` (1 hour)
3. Set **Refresh Token Rotation:** `ON` (recommended)
4. Set **Reuse Interval:** `10` (seconds)

---

## Part 7: Provider Configuration (Optional)

If you want to add social login (Google, GitHub, etc.):

### Step 1: Navigate to Providers

1. Click **Authentication** → **Providers**

### Step 2: Enable Google

1. Click **Google** provider
2. Toggle **Enable Sign in with Google** to **ON**
3. Add **Google Client ID** and **Client Secret**
4. Add **Authorized Redirect URI:**

   ```
   https://gyxxlwmqlkjqvfkceeev.supabase.co/auth/v1/callback
   ```

5. Click **Save**

**Note:** Social login is optional for MVP. Can be added in Phase 2.

---

## Part 8: Verification

### Step 1: Test Email Link

Send a password reset to your account:

1. Go to your app's forgot password page
2. Enter your email
3. Check your email for reset link
4. Verify the link format:
   - Mobile: `automatize://reset-password?token=ABC123`
   - Web: `https://automatize.app/auth/reset-password?token=ABC123`

### Step 2: Test Deep Link (Mobile)

Copy the reset link and test it:

**iOS:**

```bash
xcrun simctl openurl booted "automatize://reset-password?token=YOUR_TOKEN"
```

**Android:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "automatize://reset-password?token=YOUR_TOKEN" com.automatize.app
```

### Step 3: Test Token Validation

Reset your password via the app, then verify:

1. You can log in with new password
2. Old password no longer works
3. Token expires after 24 hours

---

## Part 9: Production Checklist

- [ ] All redirect URLs configured for production domain
- [ ] Site URL set to production domain
- [ ] Email templates customized with your branding
- [ ] Password requirements enforced (8+ chars)
- [ ] Email confirmation required (auto-confirm OFF)
- [ ] JWT expiry set appropriately (3600 = 1 hour)
- [ ] TOTP enabled for MFA
- [ ] SMS MFA enabled (optional)
- [ ] Custom claims Edge Function deployed
- [ ] RLS policies tested and verified
- [ ] Security audit completed
- [ ] Backup codes generated for test accounts

---

## Troubleshooting

### Email Links Not Working

**Problem:** Password reset links redirect to wrong URL

**Solution:**

1. Check "Site URL" setting matches your domain
2. Check "Redirect URLs" includes the deep link scheme
3. Clear browser cache and retry

### Deep Links Not Opening App

**Problem:** `automatize://reset-password?token=X` doesn't open app

**Solution:**

1. Verify URL scheme in `app.json` is `automatize`
2. Verify URL is in Supabase "Redirect URLs"
3. Rebuild app with `expo prebuild --clean`
4. Test on physical device (not just simulator)

### MFA Not Prompting

**Problem:** User signs in without MFA prompt

**Solution:**

1. Check `requiresMFA` is set in user metadata
2. Check MFA is enabled in Auth settings
3. Verify TOTP is configured correctly
4. Check frontend code handles MFA flow

### Custom Claims Not in Token

**Problem:** `tenant_id` not in JWT

**Solution:**

1. Verify Edge Function is deployed
2. Check function is called on login
3. Verify JWT is decoded correctly in frontend
4. Check custom claims in `useLocalSearchParams`

---

## Related Documentation

- [ADR-002: Authentication Strategy](../adr/002-auth-strategy.md)
- [ADR-003: Multi-Tenancy Strategy](../adr/003-multi-tenancy-strategy.md)
- [Deep Linking Guide](../guides/DEEP_LINKING.md)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

---

## Notes

- Email service is per-project (not per-environment)
- Test emails are sent from `noreply@example.com` by default
- Custom SMTP provides more control and better deliverability
- MFA can be enforced immediately or after first login
- All settings are environment-specific (dev vs. prod projects)

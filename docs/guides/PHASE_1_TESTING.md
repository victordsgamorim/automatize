# Phase 1 Testing Guide

Comprehensive manual testing procedures for authentication, multi-tenancy, and deep linking. This guide ensures all Phase 1 requirements are met before proceeding to Phase 2.

---

## Prerequisites

- Supabase project configured with migrations 001-004 applied
- All RLS policies enabled and verified
- All email templates configured
- Deep linking URLs added to Supabase Auth
- Mobile app built and deployed to simulator/device
- Web app running at `http://localhost:3000`

---

## Part 1: Authentication Flows

### Test 1.1: User Registration

**Objective:** Verify user can sign up and email confirmation works

**Steps:**

1. **Open app** (mobile or web)
2. **Go to registration screen**
3. **Fill registration form:**
   - Email: `testuser@example.com`
   - Password: `TestPassword123!`
   - Confirm: `TestPassword123!`
4. **Click "Sign Up"**
5. **Check email** for confirmation link
6. **Click confirmation link** (in email)
7. **Verify:** Redirected to dashboard or prompted to login

**Expected Results:**
- [ ] Email confirmation sent
- [ ] Confirmation link valid (opens app/redirects to web)
- [ ] User profile created in database
- [ ] `tenants` table has auto-created workspace
- [ ] `tenant_members` record created with `admin` role
- [ ] User can log in with credentials

**Edge Cases to Test:**
- [ ] Duplicate email (should error)
- [ ] Weak password (should error with feedback)
- [ ] Passwords don't match (should error)
- [ ] Invalid email format (should error)
- [ ] Confirmation link expired (24h timeout)
- [ ] Confirmation link used twice (should error)

---

### Test 1.2: User Login

**Objective:** Verify user can log in successfully

**Steps:**

1. **Go to login screen**
2. **Enter credentials:**
   - Email: `testuser@example.com`
   - Password: `TestPassword123!`
3. **Click "Login"**
4. **Verify:** Dashboard appears

**Expected Results:**
- [ ] User authenticated
- [ ] Access token stored securely (secure store, not AsyncStorage)
- [ ] User profile loaded
- [ ] Tenant context set
- [ ] Dashboard displays correctly

**Edge Cases to Test:**
- [ ] Wrong password (should error)
- [ ] Non-existent email (should error)
- [ ] Empty email/password (should error)
- [ ] User with multiple tenants (can see all workspaces)
- [ ] Logout and re-login (should work)

---

### Test 1.3: Password Reset

**Objective:** Verify password reset flow works end-to-end

**Steps:**

1. **Go to forgot password screen**
2. **Enter email:** `testuser@example.com`
3. **Click "Send Reset Link"**
4. **Check email** for reset link
5. **Click reset link** (or use deep link)
6. **Enter new password:** `NewPassword456!`
7. **Confirm password:** `NewPassword456!`
8. **Click "Reset Password"**
9. **Verify:** Success message appears
10. **Log in** with new password
11. **Verify:** Login works with new password

**Expected Results:**
- [ ] Reset email sent
- [ ] Reset link valid and opens app/redirects to web
- [ ] Password reset screen appears with token validated
- [ ] Token expires after 24 hours
- [ ] Old password no longer works
- [ ] New password works immediately

**Edge Cases to Test:**
- [ ] Invalid token (should error)
- [ ] Expired token (should error)
- [ ] Password too weak (should error with feedback)
- [ ] Passwords don't match (should error)
- [ ] Reset link used twice (should error)
- [ ] Multiple reset requests for same email (only latest works)

---

### Test 1.4: Multi-Factor Authentication (MFA) Setup

**Objective:** Verify TOTP MFA can be set up and used

**Steps:**

1. **Log in** as test user
2. **Go to security settings**
3. **Click "Set Up MFA"**
4. **Scan QR code** with authenticator app (Google Authenticator, Authy, etc.)
5. **Enter 6-digit code** from app
6. **Click "Verify"**
7. **Copy backup codes** (save somewhere safe)
8. **Logout**
9. **Log in** again with same email/password
10. **Prompt should ask for TOTP code**
11. **Enter 6-digit code** from authenticator
12. **Verify:** Dashboard appears

**Expected Results:**
- [ ] QR code displayed correctly
- [ ] TOTP setup completes
- [ ] 10 backup codes generated
- [ ] Each backup code is single-use
- [ ] MFA prompt appears on next login
- [ ] Valid TOTP code allows login
- [ ] Invalid TOTP code shows error

**Edge Cases to Test:**
- [ ] MFA setup cancelled (should not enable MFA)
- [ ] Invalid TOTP code (should error)
- [ ] Expired TOTP code (30s window, test clock skew)
- [ ] Use backup code instead of TOTP (should work)
- [ ] Backup code used twice (should error)
- [ ] Disable MFA (should allow login without TOTP)
- [ ] Multiple MFA devices (rotate devices, test latest)

---

### Test 1.5: Session Management

**Objective:** Verify session tokens are managed correctly

**Steps:**

1. **Log in** and keep app open
2. **Wait 30+ minutes** (or simulate token expiry)
3. **Try to perform action** (create invoice, etc.)
4. **Verify:** Request succeeds (token auto-refreshed)
5. **Logout**
6. **Verify:** Redirected to login

**Expected Results:**
- [ ] Access token refreshed transparently
- [ ] No interruption in user experience
- [ ] Token refresh happens in background
- [ ] Logout clears all tokens
- [ ] Logout clears local DB (optional)

**Edge Cases to Test:**
- [ ] Network offline during token refresh (should queue request)
- [ ] App backgrounded for 1+ hour (session still valid on foreground)
- [ ] Multiple concurrent requests during token refresh (only refresh once)
- [ ] Refresh token expires (force re-login)
- [ ] Token corrupted/invalid (force re-login)

---

## Part 2: Multi-Tenancy & RBAC

### Test 2.1: Tenant Isolation

**Objective:** Verify data is isolated between tenants

**Setup:**

Create two test users in different tenants:
- User A: admin in Tenant X
- User B: viewer in Tenant Y

**Steps:**

1. **Log in as User A**
2. **Create test invoice:**
   - Number: `INV-001`
   - Amount: `$1,000`
3. **Note the invoice ID**
4. **Logout**
5. **Log in as User B**
6. **Try to access User A's invoice** by ID:
   - Direct API call: `GET /invoices/INVOICE_ID`
   - GraphQL query (if available)
7. **Verify:** Error 403 Forbidden or no data returned

**Expected Results:**
- [ ] User B cannot see User A's invoices
- [ ] RLS policy blocks query (database level, not app level)
- [ ] API returns 403 or empty result
- [ ] Error logged (not exposed to user)

**Database Verification:**

```sql
-- Run in Supabase SQL editor as service role
SELECT * FROM invoices WHERE tenant_id = 'TENANT_A_ID';
-- Should show User A's invoice

-- Now test RLS by connecting as User B
-- User B should not see any results
```

**Edge Cases to Test:**
- [ ] Direct database query bypasses RLS (as service role only)
- [ ] SQL injection attempts (RLS should prevent)
- [ ] Tenant ID in JWT is wrong (RLS rejects)
- [ ] User removed from tenant (data no longer visible)
- [ ] Tenant deleted (data cascade deleted)

---

### Test 2.2: Role-Based Access Control

**Objective:** Verify permissions are enforced by role

**Setup:**

Create three test users in same tenant with different roles:
- User A: admin
- User B: editor
- User C: viewer

**Test Admin Permissions:**

As User A (admin):

1. Create invoice: `INV-001` ✓
2. Update invoice (change amount) ✓
3. Delete invoice ✓
4. Add team member ✓
5. Change team member role ✓
6. Remove team member ✓
7. View analytics ✓

**Test Editor Permissions:**

As User B (editor):

1. Create invoice: `INV-002` ✓
2. Update invoice (change amount) ✓
3. Delete invoice: ✗ (should error)
4. Add team member: ✗ (should error)
5. Change team member role: ✗ (should error)
6. Remove team member: ✗ (should error)
7. View analytics ✓

**Test Viewer Permissions:**

As User C (viewer):

1. Create invoice: ✗ (should error)
2. Update invoice: ✗ (should error)
3. Delete invoice: ✗ (should error)
4. Add team member: ✗ (should error)
5. View invoices ✓
6. View analytics ✓

**Expected Results:**
- [ ] Permissions match role definitions
- [ ] Forbidden actions return 403 errors
- [ ] UI hides buttons for forbidden actions (UX)
- [ ] RLS policies enforce at database level (security)
- [ ] Error messages are user-friendly

**Database Verification:**

```sql
-- Check tenant_members table
SELECT user_id, role FROM tenant_members WHERE tenant_id = 'TENANT_ID';

-- Verify RLS policy is enforced
-- Try to insert invoice without correct tenant_id
INSERT INTO invoices (id, tenant_id, amount, ...)
VALUES ('123', 'WRONG_TENANT_ID', 100, ...)
-- Should fail due to RLS policy
```

---

### Test 2.3: Team Member Management

**Objective:** Verify team members can be invited and managed

**Steps:**

1. **Log in as admin**
2. **Go to team settings**
3. **Click "Invite Member"**
4. **Enter email:** `newmember@example.com`
5. **Select role:** `editor`
6. **Click "Send Invitation"**
7. **Check email** for invitation link
8. **As new user, click invitation link**
9. **Sign up** with email
10. **Verify:** Automatically added to team with `editor` role
11. **As admin, verify member appears** in team list
12. **As admin, change role** to `viewer`
13. **Verify:** Member now has viewer permissions
14. **As admin, remove member**
15. **Verify:** Member can no longer access workspace

**Expected Results:**
- [ ] Invitation email sent
- [ ] Invitation link is valid (7-day expiry)
- [ ] Invitation expires after 7 days
- [ ] New user automatically added to workspace
- [ ] Role change propagates immediately
- [ ] Removed member loses access
- [ ] Member can rejoin if re-invited

**Edge Cases to Test:**
- [ ] Invite existing team member (should error)
- [ ] Invite with invalid email (should error)
- [ ] Expired invitation link (should error)
- [ ] Member accepts invitation twice (should error)
- [ ] Admin removes themselves (should error)
- [ ] Non-admin tries to invite (should error)
- [ ] Invite when user already signed up (should work)

---

### Test 2.4: Workspace Switching

**Objective:** Verify users can switch between multiple workspaces

**Setup:**

User A is admin in Tenant X and editor in Tenant Y.

**Steps:**

1. **Log in as User A**
2. **App shows User A's primary workspace (Tenant X)**
3. **Go to workspace selector**
4. **See list of available workspaces:**
   - Tenant X (admin)
   - Tenant Y (editor)
5. **Click "Switch to Tenant Y"**
6. **Verify:** Dashboard updates to show Tenant Y data
7. **Create invoice in Tenant Y**
8. **Switch back to Tenant X**
9. **Verify:** Shows Tenant X invoices (not Tenant Y)
10. **Repeat switches (5+ times)**
11. **Verify:** No data leakage between workspaces

**Expected Results:**
- [ ] All user's workspaces listed correctly
- [ ] Switch happens instantly (no delay)
- [ ] Data updates after switch
- [ ] JWT claims updated with new tenant_id
- [ ] RLS policies apply to new tenant
- [ ] No data visible from other workspaces
- [ ] Sync starts for new workspace

**Edge Cases to Test:**
- [ ] User removed from workspace while viewing it (should logout or redirect)
- [ ] Workspace deleted while user viewing (should redirect)
- [ ] Network offline during switch (should queue, sync when online)
- [ ] Multiple tabs/windows (cache inconsistency)
- [ ] Deep link to switch workspace (should work)
- [ ] Switch very rapidly (should handle gracefully)

---

## Part 3: Deep Linking

### Test 3.1: Password Reset Deep Link

**Objective:** Verify password reset via email link works on all platforms

**iOS Steps:**

1. **Request password reset** via app
2. **Check email** for reset link
3. **Copy link** (example: `automatize://reset-password?token=ABC123`)
4. **Run command:**
   ```bash
   xcrun simctl openurl booted "automatize://reset-password?token=ABC123"
   ```
5. **Verify:** App opens at reset password screen
6. **Enter new password and submit**
7. **Verify:** Success message appears

**Android Steps:**

1. **Request password reset** via app
2. **Check email** for reset link
3. **Copy link** (example: `automatize://reset-password?token=ABC123`)
4. **Run command:**
   ```bash
   adb shell am start -W -a android.intent.action.VIEW -d "automatize://reset-password?token=ABC123" com.automatize.app
   ```
5. **Verify:** App opens at reset password screen

**Web Steps:**

1. **Request password reset** via web
2. **Check email** for reset link
3. **Click link** in email
4. **Verify:** Browser navigates to `/auth/reset-password?token=ABC123`
5. **Enter new password and submit**

**Expected Results:**
- [ ] Deep link opens app (if installed)
- [ ] Token parsed correctly from URL
- [ ] Reset password screen displays
- [ ] Token validated server-side
- [ ] Password reset succeeds
- [ ] Can login with new password

**Edge Cases to Test:**
- [ ] Invalid token (should error)
- [ ] Expired token (24h timeout)
- [ ] Malformed URL (should error)
- [ ] Token with special characters (should be URL-encoded)
- [ ] App not installed (should open in browser)
- [ ] Multiple deep links in quick succession
- [ ] Deep link while app backgrounded

---

### Test 3.2: Workspace Invitation Deep Link

**Objective:** Verify invitation links work via deep linking

**Steps:**

1. **As admin, send workspace invitation**
2. **Check email** for invitation link
3. **As non-registered user, click link**
4. **Verify:** App opens signup form with email pre-filled
5. **Complete signup**
6. **Verify:** Automatically added to workspace
7. **As registered user, click different invitation link**
8. **Verify:** App shows workspace join confirmation
9. **Click "Join"**
10. **Verify:** Added to workspace

**Expected Results:**
- [ ] Invitation link opens app
- [ ] Email pre-filled for new users
- [ ] New user automatically added on signup
- [ ] Existing user can join with one click
- [ ] Role assigned per invitation
- [ ] Invitation expires after 7 days

---

### Test 3.3: Workspace Switching Deep Link

**Objective:** Verify workspace switching via deep link

**Steps:**

1. **Log in** as multi-workspace user
2. **Construct deep link:**
   ```
   automatize://switch-workspace?tenant_id=01ARZ3NDEKTSV4RRFFQ69G5FAV
   ```
3. **Test on mobile:**
   ```bash
   # iOS
   xcrun simctl openurl booted "automatize://switch-workspace?tenant_id=ABC123"

   # Android
   adb shell am start -W -a android.intent.action.VIEW -d "automatize://switch-workspace?tenant_id=ABC123" com.automatize.app
   ```
4. **Verify:** App switches to specified workspace
5. **Verify:** Data for new workspace loads
6. **Create invoice** to confirm you're in new workspace

**Expected Results:**
- [ ] Deep link switches workspace instantly
- [ ] Data updates for new workspace
- [ ] RLS policies enforce isolation
- [ ] Sync begins for new workspace

**Edge Cases to Test:**
- [ ] Unauthorized tenant (user doesn't have access)
- [ ] Non-existent tenant
- [ ] Network offline (should queue, switch when online)

---

## Part 4: Offline & Sync

### Test 4.1: Offline Data Access

**Objective:** Verify app functions offline with cached data

**Steps:**

1. **Enable Airplane Mode**
2. **App should show "Offline" badge**
3. **Navigate to list views** (invoices, clients)
4. **Verify:** Data from last sync visible
5. **Create new invoice** (offline)
6. **Verify:** Invoice appears in list (pending sync)
7. **Disable Airplane Mode**
8. **Verify:** Sync badge shows "Syncing..."
9. **Wait for sync** to complete
10. **Verify:** Invoice saved to server
11. **Sync badge shows "Synced"**

**Expected Results:**
- [ ] Offline data cached locally
- [ ] Can navigate and create records offline
- [ ] Pending operations visible
- [ ] Sync completes on reconnect
- [ ] No data loss
- [ ] No duplicate records

---

### Test 4.2: Sync Error Handling

**Objective:** Verify app handles sync errors gracefully

**Steps:**

1. **Create invoice** (online)
2. **Simulate network error:**
   - Disable WiFi and cellular
   - Or use Charles/Fiddler to block requests
3. **Wait for sync retry**
4. **Verify:** Error badge appears
5. **Verify:** "Retry" button available
6. **Re-enable network**
7. **Click "Retry"**
8. **Verify:** Sync completes

**Expected Results:**
- [ ] Sync retries with exponential backoff
- [ ] Error message is user-friendly
- [ ] Retry button available
- [ ] No data loss on retry
- [ ] Eventual consistency achieved

---

## Part 5: RLS Policy Verification

### Verification 5.1: RLS Enabled

**Steps:**

1. **Go to Supabase dashboard**
2. **Click "Authentication" → "Policies"**
3. **Verify:** RLS **Enabled** for these tables:
   - [ ] `tenants`
   - [ ] `tenant_members`
   - [ ] `invoices`
   - [ ] `clients`
   - [ ] `products`
   - [ ] `mfa_backup_codes`

4. **For each table, verify policies exist for:**
   - [ ] SELECT
   - [ ] INSERT
   - [ ] UPDATE
   - [ ] DELETE

---

### Verification 5.2: RLS Policy Content

**Steps:**

Run these SQL queries in Supabase SQL editor to verify policies:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies on invoices table
SELECT * FROM pg_policies WHERE tablename = 'invoices';

-- Expected output should include:
-- - "Users can view invoices in their tenant" (SELECT)
-- - "Admins and editors can create invoices" (INSERT)
-- - "Only admins can update invoices" (UPDATE)
-- - "Only admins can delete invoices" (DELETE)
```

---

### Verification 5.3: Cross-Tenant Data Access (Negative Test)

**Steps:**

Run as SERVICE ROLE ONLY (never expose to client):

```sql
-- Create test data
INSERT INTO tenants (id, name, owner_id, created_at, updated_at, version)
VALUES ('tenant_a', 'Test Tenant A', 'user-a-uuid', NOW(), NOW(), 1);

INSERT INTO invoices (id, tenant_id, number, amount, status, ...)
VALUES ('inv_1', 'tenant_a', 'INV-001', 1000, 'draft', ...);

-- Now test RLS as User A (who has access to tenant_a)
-- This should work:
SELECT * FROM invoices WHERE tenant_id = 'tenant_a';
-- Result: Shows invoice (or empty if user not in tenant)

-- Test as User B (no access to tenant_a)
-- This should NOT work due to RLS:
SELECT * FROM invoices WHERE id = 'inv_1';
-- Result: No rows returned (RLS blocks it)
```

---

## Part 6: Security Checklist

### Test 6.1: PII Not Logged

**Objective:** Verify PII is not exposed in logs

**Steps:**

1. **Enable browser dev tools** (Console tab)
2. **Log in** with test account
3. **Search console logs** for PII:
   - Email address ✗
   - Password ✗
   - Full name ✗
   - Phone number ✗
4. **Verify:** No sensitive data logged
5. **Check Supabase logs** for same
6. **Verify:** Tokens visible but hashed where needed

---

### Test 6.2: Tokens Not in AsyncStorage

**Objective:** Verify tokens stored securely (not AsyncStorage)

**Steps:**

**Mobile:**

1. **Log in** to app
2. **Connect debugger** (Flipper for React Native)
3. **Check AsyncStorage:** Should be empty (no tokens)
4. **Check Keychain/Keystore:** Should have encrypted token
5. **Logout**
6. **Verify:** Token removed from secure storage

**Web:**

1. **Log in** to web app
2. **Open DevTools** → Application → Local Storage
3. **Search for tokens:** Should not be visible
4. **Check cookies:** Auth cookies should be secure/http-only
5. **Logout**
6. **Verify:** Tokens cleared

---

### Test 6.3: HTTPS Enforcement

**Objective:** Verify all API calls use HTTPS

**Steps:**

1. **Open DevTools** → Network tab
2. **Log in** (or perform API action)
3. **Check all requests:**
   - [ ] All URLs are `https://`
   - [ ] No mixed content warnings
   - [ ] Certificates are valid

**Production Only:** Verify HSTS header is set:

```bash
curl -I https://api.automatize.app
# Look for: Strict-Transport-Security: max-age=31536000
```

---

## Part 7: Performance Checklist

### Test 7.1: Load Times

**Objective:** Verify app loads quickly

**Measurements:**

- [ ] Login page loads: < 2 seconds
- [ ] Login API call: < 1 second
- [ ] Dashboard loads: < 2 seconds
- [ ] Invoice list (50 items): < 1 second
- [ ] Deep link opens: < 3 seconds

Use browser DevTools → Performance tab to measure.

---

### Test 7.2: Memory Usage

**Objective:** Verify no memory leaks

**Steps:**

1. **Open DevTools** (Chrome on desktop)
2. **Take heap snapshot** (initial)
3. **Perform 10 user actions** (navigate, create, delete)
4. **Force garbage collection**
5. **Take heap snapshot** (final)
6. **Compare heap sizes:**
   - [ ] Difference < 10 MB
   - [ ] No detached DOM nodes
   - [ ] No circular references

---

## Phase 1 Completion Checklist

Before marking Phase 1 as complete:

### Authentication ✓

- [ ] Registration flow works end-to-end
- [ ] Email confirmation required and working
- [ ] Login flow works
- [ ] Logout clears all state
- [ ] Password reset works via email link
- [ ] Password reset works via deep link
- [ ] TOTP MFA setup works
- [ ] TOTP MFA validation works
- [ ] Backup codes work
- [ ] Session tokens refresh automatically
- [ ] Token refresh on network reconnect
- [ ] Concurrent requests handled correctly
- [ ] 401 errors trigger re-login

### Multi-Tenancy ✓

- [ ] Users can create workspaces
- [ ] Users can invite team members
- [ ] Team members have correct roles
- [ ] Permissions enforced by role
- [ ] Data isolated between tenants
- [ ] RLS policies prevent cross-tenant access
- [ ] Users can switch workspaces
- [ ] Workspace switch updates context
- [ ] Workspace deletion cascades correctly
- [ ] User removal revokes access

### Deep Linking ✓

- [ ] Password reset link works on iOS
- [ ] Password reset link works on Android
- [ ] Password reset link works on Web
- [ ] Invitation link works on iOS
- [ ] Invitation link works on Android
- [ ] Workspace switch link works
- [ ] Invalid links show error
- [ ] Expired links show error

### Security ✓

- [ ] Tokens stored securely (not AsyncStorage)
- [ ] PII not logged
- [ ] RLS policies enforced
- [ ] Cross-tenant access blocked
- [ ] HTTPS only
- [ ] JWT tokens validated
- [ ] No hardcoded secrets

### Offline & Sync ✓

- [ ] App works offline
- [ ] Data cached locally
- [ ] Sync works when online
- [ ] Pending operations tracked
- [ ] Sync errors handled gracefully
- [ ] No data loss on sync failures

### Performance ✓

- [ ] Login < 3 seconds
- [ ] Dashboard < 2 seconds
- [ ] List navigation < 1 second
- [ ] No memory leaks
- [ ] Lighthouse score > 90

### Documentation ✓

- [ ] ADR-002: Authentication Strategy
- [ ] ADR-003: Multi-Tenancy Strategy
- [ ] Deep Linking Guide
- [ ] Supabase Auth Setup Runbook
- [ ] Phase 1 Testing Guide (this document)
- [ ] All features documented

---

## Next Steps

After completing Phase 1 testing:

1. **Code Review:** Get approval from team lead
2. **Merge to Main:** Merge all PRs to main branch
3. **Tag Release:** Create v0.1.0 release
4. **Phase 2 Planning:** Start planning Phase 2 (Invoices & Clients)

---

## Related Documentation

- [ADR-002: Authentication Strategy](../adr/002-auth-strategy.md)
- [ADR-003: Multi-Tenancy Strategy](../adr/003-multi-tenancy-strategy.md)
- [Deep Linking Guide](./DEEP_LINKING.md)
- [Supabase Auth Setup](../runbooks/SUPABASE_AUTH_SETUP.md)

---

## Testing Notes

- Test on multiple devices (not just simulators)
- Test on slow networks (not just WiFi)
- Test on old phones (performance)
- Test with VPN (network changes)
- Test across time zones (MFA timing)
- Test with multiple users simultaneously (concurrency)

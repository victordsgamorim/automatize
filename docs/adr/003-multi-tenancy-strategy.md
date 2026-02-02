# ADR-003: Multi-Tenancy Strategy

**Date Created:** 2026-02-02
**Date Accepted:** 2026-02-02
**Status:** Accepted
**Deciders:** Development Team

---

## Context

The Automatize project serves multiple independent organizations (tenants), each with:

- Isolated data (invoices, clients, products belong to a specific tenant)
- Isolated users (team members belong to a specific tenant)
- Role-based access control (admin, editor, viewer within tenant)
- Multi-workspace support (users can belong to multiple tenants)
- Strict data boundaries (no cross-tenant data leakage)

We need a solution that:

- Enforces tenant isolation at the database layer (not application layer)
- Supports multi-workspace switching without re-authentication
- Provides fine-grained role-based permissions
- Handles team member invitations and access revocation
- Is verifiable and auditable (tenant_id always validated)
- Works offline (tenant context persisted locally)
- Scales efficiently (no n+1 queries, indexed lookups)

---

## Decision

We will implement multi-tenancy using **Row-Level Security (RLS) policies in Postgres**, **JWT custom claims** for tenant context, and **tenant_id on all entities** for enforcement.

### Key Implementation Details

#### 1. Tenant Data Model

**Core Tables:**

```sql
-- Tenants table
CREATE TABLE tenants (
  id ULID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  version INTEGER DEFAULT 1,
  CONSTRAINT unique_tenant_per_owner UNIQUE(owner_id, id)
);

-- Tenant members (RBAC)
CREATE TABLE tenant_members (
  id ULID PRIMARY KEY,
  tenant_id ULID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  version INTEGER DEFAULT 1,
  CONSTRAINT unique_member_per_tenant UNIQUE(tenant_id, user_id) DEFERRABLE INITIALLY DEFERRED
);

-- User profiles (PII table, separate schema)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- MFA backup codes (encrypted PII)
CREATE TABLE mfa_backup_codes (
  id ULID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash VARCHAR(255) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_code_per_user UNIQUE(user_id, code_hash)
);

-- Example operational table (invoices)
CREATE TABLE invoices (
  id ULID PRIMARY KEY,
  tenant_id ULID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  number VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  client_id ULID NOT NULL,
  due_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  version INTEGER DEFAULT 1,
  CONSTRAINT unique_invoice_number_per_tenant UNIQUE(tenant_id, number)
);

-- Indexes for efficient queries
CREATE INDEX idx_tenants_owner ON tenants(owner_id);
CREATE INDEX idx_tenant_members_user ON tenant_members(user_id);
CREATE INDEX idx_tenant_members_tenant ON tenant_members(tenant_id);
CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_status ON invoices(tenant_id, status);
CREATE INDEX idx_mfa_codes_user ON mfa_backup_codes(user_id);
```

#### 2. JWT Custom Claims

**Token Structure:**
```json
{
  "iss": "https://gyxxlwmqlkjqvfkceeev.supabase.co",
  "sub": "user-uuid-here",
  "aud": "authenticated",
  "exp": 1643723040,
  "iat": 1643719440,
  "auth_time": 1643719440,
  "session_id": "session-uuid",
  "is_anonymous": false,
  "tenant_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "role": "admin",
  "permissions": ["invoices:create", "invoices:read", "invoices:update", "invoices:delete", "clients:*", "products:*"],
  "current_workspace_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV"
}
```

**Custom Claims Set In:**
- Supabase Auth hook or Edge Function
- Every time user logs in or switches workspace
- On MFA completion
- On token refresh

**Values Sourced From:**
- `tenant_id`: Current active workspace
- `role`: User's role in that workspace (`tenant_members.role`)
- `permissions`: Derived from role (admin: all, editor: modify, viewer: read-only)
- `current_workspace_id`: Same as `tenant_id` (for clarity)

#### 3. Row-Level Security (RLS) Policies

**Mandatory RLS:**
- RLS **ENABLED** on 100% of exposed tables
- Policies for SELECT, INSERT, UPDATE, DELETE on each table
- Policies validate `tenant_id` from JWT claims

**Example RLS Policies for Invoices:**

```sql
-- SELECT: Users can only see invoices in their current tenant
CREATE POLICY "Users can view invoices in their tenant"
  ON invoices FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::ULID
  );

-- INSERT: Users with 'admin' or 'editor' role can create invoices
CREATE POLICY "Admins and editors can create invoices"
  ON invoices FOR INSERT
  WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::ULID
    AND (auth.jwt() ->> 'role') IN ('admin', 'editor')
  );

-- UPDATE: Only admin can update invoices
CREATE POLICY "Only admins can update invoices"
  ON invoices FOR UPDATE
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::ULID
    AND (auth.jwt() ->> 'role') = 'admin'
  )
  WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::ULID
    AND (auth.jwt() ->> 'role') = 'admin'
  );

-- DELETE: Only admin can delete invoices (soft delete)
CREATE POLICY "Only admins can delete invoices"
  ON invoices FOR DELETE
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::ULID
    AND (auth.jwt() ->> 'role') = 'admin'
  );
```

**Tenant Member Policies:**

```sql
-- SELECT: Users can only see members of their current tenant
CREATE POLICY "Users can view tenant members"
  ON tenant_members FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::ULID
  );

-- INSERT: Only admin can add members
CREATE POLICY "Only admins can add members"
  ON tenant_members FOR INSERT
  WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::ULID
    AND (auth.jwt() ->> 'role') = 'admin'
  );

-- UPDATE: Only admin can change roles
CREATE POLICY "Only admins can update member roles"
  ON tenant_members FOR UPDATE
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::ULID
    AND (auth.jwt() ->> 'role') = 'admin'
  );

-- DELETE: Only admin can remove members
CREATE POLICY "Only admins can remove members"
  ON tenant_members FOR DELETE
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::ULID
    AND (auth.jwt() ->> 'role') = 'admin'
  );
```

**Tenant Policies:**

```sql
-- SELECT: Users can view their own tenant info
CREATE POLICY "Users can view their tenants"
  ON tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid()
        AND deleted_at IS NULL
    )
  );

-- UPDATE: Only tenant owner can update
CREATE POLICY "Only owner can update tenant"
  ON tenants FOR UPDATE
  USING (
    owner_id = auth.uid()
  );
```

#### 4. Workspace Switching

**Workflow:**

```typescript
interface Tenant {
  id: string; // ULID
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}

// 1. Fetch all tenants user belongs to
async function getUserTenants(): Promise<Tenant[]> {
  const { data, error } = await supabase
    .from('tenant_members')
    .select('tenant_id, role, tenants(name)')
    .eq('user_id', userId)
    .is('deleted_at', null);

  return data.map(m => ({
    id: m.tenant_id,
    name: m.tenants.name,
    role: m.role
  }));
}

// 2. Switch to different workspace
async function switchWorkspace(tenantId: string) {
  // Call Edge Function to update JWT claims
  const { data, error } = await supabase.functions.invoke(
    'switch-workspace',
    { body: { tenantId } }
  );

  if (error) throw error;

  // Store new access/refresh tokens
  await saveTokens(data.accessToken, data.refreshToken);

  // Update Zustand state
  authStore.setTenant(tenantId);
  authStore.setRole(data.role);

  // Invalidate query cache (different tenant data)
  queryClient.clear();

  // Re-sync from new tenant's data
  await triggerSync();
}
```

**Edge Function (switch-workspace):**

```typescript
// supabase/functions/switch-workspace/index.ts
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: Request) {
  const { tenantId } = z.object({
    tenantId: z.string().ulid()
  }).parse(await req.json());

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  // Verify JWT and get user
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return new Response('Unauthorized', { status: 401 });

  const userId = data.user.id;

  // Verify user has access to tenant
  const { data: membership, error: memberError } = await supabaseAdmin
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (memberError || !membership) {
    return new Response('Forbidden', { status: 403 });
  }

  // Generate new JWT with updated claims
  const newJWT = supabaseAdmin.auth.admin.createSession({
    user_id: userId,
    factor_id: null, // MFA factor if needed
  });

  // Return new tokens
  return Response.json({
    accessToken: newJWT.access_token,
    refreshToken: newJWT.refresh_token,
    role: membership.role
  });
}
```

#### 5. Role-Based Access Control (RBAC)

**Roles:**
- **admin**: Full access (CRUD on all resources, manage team members)
- **editor**: Create and modify content (CRU, no delete, no member management)
- **viewer**: Read-only access (R only)

**Permission Mapping:**

```typescript
const rolePermissions = {
  admin: [
    // Invoices
    'invoices:create', 'invoices:read', 'invoices:update', 'invoices:delete',
    // Clients
    'clients:create', 'clients:read', 'clients:update', 'clients:delete',
    // Products
    'products:create', 'products:read', 'products:update', 'products:delete',
    // Analytics
    'analytics:read',
    // Team Management
    'team:read', 'team:invite', 'team:update', 'team:remove',
    // Settings
    'settings:read', 'settings:update'
  ],
  editor: [
    'invoices:create', 'invoices:read', 'invoices:update',
    'clients:create', 'clients:read', 'clients:update',
    'products:create', 'products:read', 'products:update',
    'analytics:read',
    'team:read',
    'settings:read'
  ],
  viewer: [
    'invoices:read',
    'clients:read',
    'products:read',
    'analytics:read',
    'team:read'
  ]
};

// Check permission in frontend
function canPerform(action: string, userPermissions: string[]): boolean {
  return userPermissions.includes(action) || userPermissions.includes('*');
}

// Example: Conditionally render delete button
function InvoiceRow({ invoice, permissions }) {
  return (
    <div>
      <span>{invoice.number}</span>
      {canPerform('invoices:delete', permissions) && (
        <Button onClick={() => deleteInvoice(invoice.id)}>Delete</Button>
      )}
    </div>
  );
}
```

#### 6. Team Member Invitation

**Invitation Flow:**

```typescript
// 1. Admin sends invitation (creates pending member record)
async function inviteMember(email: string, role: 'admin' | 'editor' | 'viewer') {
  const { data, error } = await supabase.functions.invoke(
    'invite-member',
    { body: { email, role, tenantId } }
  );

  if (error) throw error;
  return data.invitationLink;
}

// 2. Edge Function: Create invitation and send email
async function handleInvitation(email: string, role: string, tenantId: string) {
  // Create pending invitation record
  const invitationId = generateULID();

  await supabaseAdmin
    .from('member_invitations')
    .insert({
      id: invitationId,
      tenant_id: tenantId,
      email,
      role,
      invited_by: userId,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

  // Send email with sign-up link
  const signUpLink = `${APP_URL}/auth/register?invitation=${invitationId}&email=${email}`;

  await sendEmail({
    to: email,
    subject: `You've been invited to ${tenantName}`,
    body: `Click here to join: ${signUpLink}`
  });

  return signUpLink;
}

// 3. User clicks link and signs up
async function registerWithInvitation(invitationId: string, password: string) {
  // Fetch invitation
  const { data: invitation } = await supabase
    .from('member_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (!invitation || invitation.status !== 'pending') {
    throw new ValidationError('Invalid or expired invitation');
  }

  // Create auth user
  const { data: auth, error } = await supabase.auth.signUp({
    email: invitation.email,
    password
  });

  if (error) throw error;

  // Create tenant member record
  await supabase
    .from('tenant_members')
    .insert({
      id: generateULID(),
      tenant_id: invitation.tenant_id,
      user_id: auth.user.id,
      role: invitation.role
    });

  // Mark invitation as used
  await supabase
    .from('member_invitations')
    .update({ status: 'used' })
    .eq('id', invitationId);

  // User is now member of tenant
  return { success: true };
}
```

#### 7. Tenant Deletion (Cascading)

**Soft Delete Pattern:**

```typescript
async function deleteTenant(tenantId: string) {
  // Only owner can delete
  const { data: tenant } = await supabase
    .from('tenants')
    .select('owner_id')
    .eq('id', tenantId)
    .single();

  if (tenant.owner_id !== auth.uid()) {
    throw new PermissionError('Only owner can delete tenant');
  }

  // Soft delete all related records
  // Database handles cascading via foreign keys
  await supabase
    .from('tenants')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', tenantId);

  // Note: Actual data removal happens via GDPR deletion routine
  // (user exports data first, then hard delete after retention period)
}
```

#### 8. PII Isolation

**Strategy: Separate Sensitive Data**

```sql
-- Public schema (operational data)
CREATE TABLE public.invoices (
  id ULID,
  tenant_id ULID,
  amount DECIMAL,
  due_date TIMESTAMP,
  -- No PII
);

-- Private schema (PII)
CREATE TABLE private.user_profiles (
  id UUID REFERENCES auth.users(id),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  -- All PII isolated
);

-- Private schema (payment info, never stored locally)
CREATE TABLE private.payment_methods (
  id ULID,
  user_id UUID REFERENCES auth.users(id),
  last_4_digits VARCHAR(4),
  expiry_month INT,
  expiry_year INT,
  -- Only last 4 digits, PII minimized
);
```

**RLS on Private Schema:**

```sql
-- Users can only access their own PII
ALTER DEFAULT PRIVILEGES IN SCHEMA private GRANT SELECT ON TABLES TO authenticated;

CREATE POLICY "Users can only read their own profile"
  ON private.user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON private.user_profiles FOR UPDATE
  USING (id = auth.uid());
```

#### 9. Local Sync (WatermelonDB)

**Tenant Context in Local DB:**

```typescript
// WatermelonDB migrations
const migrations = [
  {
    toVersion: 1,
    steps: [
      createTable({
        name: 'tenants',
        columns: [
          { name: 'id', type: 'string', isIndexed: true },
          { name: 'name', type: 'string' },
          { name: 'is_active', type: 'boolean', value: false }
        ]
      }),
      createTable({
        name: 'invoices',
        columns: [
          { name: 'id', type: 'string', isIndexed: true },
          { name: 'tenant_id', type: 'string', isIndexed: true },
          { name: 'number', type: 'string' },
          { name: 'amount', type: 'number' }
        ]
      })
    ]
  }
];

// Query invoices for current tenant
async function getInvoices(tenantId: string) {
  const invoices = await database
    .get('invoices')
    .query(Q.where('tenant_id', Q.eq(tenantId)))
    .fetch();

  return invoices;
}
```

**Sync Filter by Tenant:**

```typescript
// Pull changes only for current tenant
async function pullChanges(tenantId: string, cursor: string) {
  const changes = await supabase
    .from('sync_pull')
    .rpc('pull_changes', {
      p_cursor: cursor,
      p_tenant_id: tenantId
    });

  // Apply to WatermelonDB
  await database.write(async () => {
    for (const change of changes) {
      // Create/update/delete based on operation
    }
  });
}
```

---

## Consequences

### Positive

- **Bulletproof Isolation**: RLS enforced at DB layer, not application layer
- **Zero Trust**: Server never trusts client's tenant_id claim, always validates
- **Audit Trail**: Every query filtered by RLS, fully auditable
- **Performance**: Indexes on tenant_id make queries efficient
- **Compliance**: LGPD/GDPR ready (tenant deletion cascades, PII isolated)
- **Scalability**: Multi-tenant architecture supports unlimited tenants
- **Offline Support**: Tenant context persisted in local DB, works offline
- **Flexible Roles**: Easy to add new roles, modify permissions
- **Team Collaboration**: Multiple workspaces per user, seamless switching

### Negative

- **RLS Debugging**: Hard to debug RLS policy issues (no visibility into why policy rejected query)
- **Policy Complexity**: Many RLS policies can become hard to maintain
- **Performance Overhead**: RLS adds filter on every query (minimal with indexes)
- **JWT Bloat**: Custom claims increase token size (not significant for our use case)
- **Token Revocation**: Changing role doesn't immediately reflect (mitigated by short token TTL)
- **Workspace Switching**: Requires full cache invalidation and resync

### Neutral

- **Database Load**: More policies = more CPU on database (mitigated by effective indexes)
- **Team Invitations**: Requires Edge Function infrastructure (standard Supabase feature)

---

## Alternatives Considered

### Alternative 1: Application-Level Filtering

- **Pros**: Simpler to implement, easy to debug
- **Cons**: Security vulnerability if filtering logic has bugs, not zero-trust, audit trail missing
- **Rejected**: Violates "never trust the client" principle from CLAUDE.md

### Alternative 2: Separate Database Per Tenant

- **Pros**: Complete isolation, simple data model
- **Cons**: Operational overhead, schema migrations per tenant, expensive (n databases)
- **Rejected**: Not cost-effective, complex operational burden

### Alternative 3: Partitioned Tables (Postgres)

- **Pros**: Logical isolation without RLS overhead
- **Cons**: Complex schema, migrations harder, less flexible
- **Rejected**: RLS + indexes is simpler and sufficient

### Alternative 4: Single Flat Role Model

- **Pros**: Simpler to implement
- **Cons**: Not flexible for team collaboration, cannot distinguish admin/viewer
- **Rejected**: Does not support team collaboration requirement

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Multi-Tenancy Guide](https://supabase.com/docs/guides/database/postgres/row-level-security/multi-tenancy)
- [OWASP Multi-Tenancy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Cloud_Application_Security_Guidance.html)
- [JWT with Custom Claims](https://supabase.com/docs/guides/auth/managing-user-data#using-custom-claims)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [ADR-002: Authentication Strategy](./002-auth-strategy.md)

---

## Notes

- This decision was made in Phase 1 (Authentication & Multi-tenancy)
- RLS policies should be thoroughly tested (add tests for policy enforcement)
- Audit logs can be added later via Postgres triggers or Supabase audit table
- Passwordless tenant creation (auto-create on first login) can be implemented
- Team member invitations by email is MVP; invite by link/code can be added later
- Tenant transfer (ownership change) requires careful RLS policy adjustment
- Cross-tenant data export for GDPR/LGPD requires explicit Edge Function (not auto)

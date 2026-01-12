# RLS Policies Template

This document provides templates for Row Level Security (RLS) policies in Supabase.

## Overview

All tables exposed via API **must** have RLS enabled and appropriate policies configured.

## Principles

1. **Enable RLS on all tables**: No exceptions for tables exposed to the client
2. **Tenant isolation is mandatory**: All queries must filter by `tenant_id`
3. **Least privilege**: Only grant necessary permissions
4. **Service role only in Edge Functions**: Never expose service role key to clients

---

## Base Entity Table Template

Every entity table should have these mandatory fields:

```sql
CREATE TABLE example_entity (
  id TEXT PRIMARY KEY,              -- ULID
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,           -- NULL for active records
  version INTEGER NOT NULL DEFAULT 0,
  tenant_id TEXT NOT NULL,          -- ULID

  -- Entity-specific fields
  name TEXT NOT NULL,
  description TEXT
);

-- Enable RLS
ALTER TABLE example_entity ENABLE ROW LEVEL SECURITY;

-- Create index for tenant_id (performance)
CREATE INDEX idx_example_entity_tenant_id ON example_entity(tenant_id);
CREATE INDEX idx_example_entity_deleted_at ON example_entity(deleted_at) WHERE deleted_at IS NULL;
```

---

## Standard RLS Policies

### 1. SELECT Policy

Allow users to read only their tenant's data:

```sql
CREATE POLICY "Users can select their tenant's records"
  ON example_entity
  FOR SELECT
  USING (
    tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'
    AND deleted_at IS NULL
  );
```

### 2. INSERT Policy

Allow users to insert only to their tenant:

```sql
CREATE POLICY "Users can insert to their tenant"
  ON example_entity
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'
  );
```

### 3. UPDATE Policy

Allow users to update only their tenant's records:

```sql
CREATE POLICY "Users can update their tenant's records"
  ON example_entity
  FOR UPDATE
  USING (
    tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'
    AND deleted_at IS NULL
  )
  WITH CHECK (
    tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'
  );
```

### 4. DELETE Policy (Soft Delete)

Soft delete via UPDATE (set `deleted_at`):

```sql
-- No DELETE policy needed - use UPDATE to set deleted_at
```

---

## Role-Based Policies (RBAC)

If implementing role-based access control:

```sql
-- Helper function to check user role
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() -> 'app_metadata' ->> 'role' = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin-only UPDATE example
CREATE POLICY "Only admins can update sensitive fields"
  ON example_entity
  FOR UPDATE
  USING (
    tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'
    AND user_has_role('admin')
  );
```

---

## PII Tables (Separate Schema)

For tables containing PII (Personal Identifiable Information):

```sql
-- Create private schema
CREATE SCHEMA IF NOT EXISTS private;

-- Example PII table
CREATE TABLE private.user_pii (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth.users(id),
  tenant_id TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT
);

ALTER TABLE private.user_pii ENABLE ROW LEVEL SECURITY;

-- Strict policy for PII
CREATE POLICY "Users can only access their own PII"
  ON private.user_pii
  FOR SELECT
  USING (
    user_id = auth.uid()
    AND tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'
  );
```

---

## Testing RLS Policies

Always test RLS policies before deploying to production:

```sql
-- Set user context for testing
SET request.jwt.claims = '{"sub": "user-id", "app_metadata": {"tenant_id": "tenant-123", "role": "editor"}}';

-- Try to query as this user
SELECT * FROM example_entity;

-- Should only return records where tenant_id = 'tenant-123'
```

---

## Migration Checklist

When creating a new table:

- [ ] Add mandatory fields (id, created_at, updated_at, deleted_at, version, tenant_id)
- [ ] Enable RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] Create tenant_id index
- [ ] Create SELECT policy
- [ ] Create INSERT policy
- [ ] Create UPDATE policy
- [ ] Test policies with different user contexts
- [ ] Document any custom policies in ADR

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

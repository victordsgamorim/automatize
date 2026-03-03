-- Phase 1: Row Level Security (RLS) Policies
-- Enforces tenant isolation and role-based access control

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TENANTS TABLE POLICIES
-- ============================================================================
-- Users can only see tenants they are members of

CREATE POLICY tenants_select_own
  ON public.tenants
  FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY tenants_insert_authenticated
  ON public.tenants
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY tenants_update_admin
  ON public.tenants
  FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY tenants_delete_admin
  ON public.tenants
  FOR DELETE
  USING (
    id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- USER_PROFILES TABLE POLICIES
-- ============================================================================
-- Users can see their own profile and profiles of users in their tenants

CREATE POLICY user_profiles_select_own_or_shared_tenant
  ON public.user_profiles
  FOR SELECT
  USING (
    id = auth.uid() OR
    id IN (
      SELECT DISTINCT tm.user_id
      FROM public.tenant_members tm
      WHERE tm.tenant_id IN (
        SELECT tenant_id FROM public.tenant_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY user_profiles_insert_own
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY user_profiles_update_own
  ON public.user_profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- TENANT_MEMBERS TABLE POLICIES
-- ============================================================================
-- Users can see members of tenants they belong to
-- Only admins can add/remove/update members

CREATE POLICY tenant_members_select_own_tenants
  ON public.tenant_members
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY tenant_members_insert_admin
  ON public.tenant_members
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY tenant_members_update_admin
  ON public.tenant_members
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY tenant_members_delete_admin
  ON public.tenant_members
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- MFA_BACKUP_CODES TABLE POLICIES
-- ============================================================================
-- Users can only see their own backup codes

CREATE POLICY mfa_backup_codes_select_own
  ON public.mfa_backup_codes
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY mfa_backup_codes_insert_own
  ON public.mfa_backup_codes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY mfa_backup_codes_update_own
  ON public.mfa_backup_codes
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY mfa_backup_codes_delete_own
  ON public.mfa_backup_codes
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- COMMENTS FOR RLS POLICIES
-- ============================================================================
COMMENT ON POLICY tenants_select_own ON public.tenants IS
  'Users can only see tenants they are members of';

COMMENT ON POLICY tenant_members_insert_admin ON public.tenant_members IS
  'Only admins of a tenant can add new members';

COMMENT ON POLICY tenant_members_update_admin ON public.tenant_members IS
  'Only admins of a tenant can update member roles';

COMMENT ON POLICY mfa_backup_codes_select_own ON public.mfa_backup_codes IS
  'Users can only see their own backup codes (PII protection)';

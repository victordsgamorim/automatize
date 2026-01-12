-- Phase 1: Initial Schema for Authentication & Multi-tenancy
-- Creates tables for tenants, user profiles, tenant members, and MFA backup codes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TENANTS TABLE
-- ============================================================================
-- Represents organizations/workspaces that isolate data
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  -- Constraints
  CONSTRAINT valid_name CHECK (char_length(name) > 0 AND char_length(name) <= 255),
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$')
);

CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_deleted_at ON public.tenants(deleted_at);

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
-- Extends auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  default_tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_display_name CHECK (char_length(display_name) > 0 AND char_length(display_name) <= 255)
);

CREATE INDEX idx_user_profiles_default_tenant_id ON public.user_profiles(default_tenant_id);

-- ============================================================================
-- TENANT MEMBERS TABLE
-- ============================================================================
-- Junction table for user-tenant relationships with roles
CREATE TABLE IF NOT EXISTS public.tenant_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure unique membership (user can't have multiple roles in same tenant)
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);
CREATE INDEX idx_tenant_members_user_id ON public.tenant_members(user_id);
CREATE INDEX idx_tenant_members_role ON public.tenant_members(role);

-- ============================================================================
-- MFA BACKUP CODES TABLE
-- ============================================================================
-- Stores hashed one-time backup codes for account recovery
CREATE TABLE IF NOT EXISTS public.mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure codes are unique per user (prevent reuse)
  UNIQUE(user_id, code_hash)
);

CREATE INDEX idx_mfa_backup_codes_user_id ON public.mfa_backup_codes(user_id);
CREATE INDEX idx_mfa_backup_codes_used_at ON public.mfa_backup_codes(used_at);

-- ============================================================================
-- TRIGGERS FOR AUDIT TIMESTAMPS
-- ============================================================================
-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tenants table
CREATE TRIGGER tenants_update_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for user_profiles table
CREATE TRIGGER user_profiles_update_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for tenant_members table
CREATE TRIGGER tenant_members_update_updated_at
  BEFORE UPDATE ON public.tenant_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.tenants IS 'Organizations/workspaces for data isolation and multi-tenancy';
COMMENT ON TABLE public.user_profiles IS 'Extended user information beyond auth.users';
COMMENT ON TABLE public.tenant_members IS 'User-tenant relationships with role-based access control';
COMMENT ON TABLE public.mfa_backup_codes IS 'Hashed one-time backup codes for MFA recovery';

COMMENT ON COLUMN public.tenants.slug IS 'URL-friendly identifier for tenant';
COMMENT ON COLUMN public.tenant_members.role IS 'User role in tenant: admin, editor, or viewer';
COMMENT ON COLUMN public.mfa_backup_codes.used_at IS 'Timestamp when backup code was used (NULL if unused)';

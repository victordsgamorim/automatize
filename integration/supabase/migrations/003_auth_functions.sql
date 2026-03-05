-- Phase 1: Authentication Functions & Custom JWT Claims
-- Implements custom JWT claims for tenant and role information

-- ============================================================================
-- FUNCTION: Get user's custom claims
-- ============================================================================
-- This function retrieves custom claims for the authenticated user
-- Used by Supabase to add claims to the JWT token
CREATE OR REPLACE FUNCTION public.get_custom_claims(user_id UUID)
RETURNS JSON AS $$
DECLARE
  default_tenant UUID;
  user_role TEXT;
  tenant_ids UUID[];
BEGIN
  -- Get user's default tenant
  SELECT default_tenant_id INTO default_tenant
  FROM public.user_profiles
  WHERE id = user_id;

  -- If no default tenant is set, use the first tenant they belong to
  IF default_tenant IS NULL THEN
    SELECT tenant_id INTO default_tenant
    FROM public.tenant_members
    WHERE user_id = user_id
    LIMIT 1;
  END IF;

  -- Get user's role in the default tenant
  IF default_tenant IS NOT NULL THEN
    SELECT role INTO user_role
    FROM public.tenant_members
    WHERE tenant_id = default_tenant AND user_id = user_id;
  END IF;

  -- Get all tenant IDs the user belongs to
  SELECT ARRAY_AGG(DISTINCT tenant_id) INTO tenant_ids
  FROM public.tenant_members
  WHERE user_id = user_id AND deleted_at IS NULL;

  -- Return custom claims as JSON
  RETURN json_build_object(
    'tenant_id', default_tenant,
    'role', COALESCE(user_role, 'viewer'),
    'tenant_ids', COALESCE(tenant_ids, ARRAY[]::UUID[])
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- FUNCTION: Trigger to set user's default tenant on first sign-up
-- ============================================================================
-- Automatically creates a personal tenant and profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  tenant_id UUID;
  slug TEXT;
BEGIN
  -- Generate a unique slug from email
  slug := LOWER(REGEXP_REPLACE(NEW.email, '@.*', ''));

  -- Make slug unique by appending random suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.tenants WHERE slug = slug) LOOP
    slug := slug || '-' || SUBSTRING(MD5(NOW()::TEXT || RANDOM()::TEXT), 1, 5);
  END LOOP;

  -- Create a personal tenant for the user
  INSERT INTO public.tenants (name, slug)
  VALUES (
    SPLIT_PART(NEW.email, '@', 1) || '''s workspace',
    slug
  )
  RETURNING id INTO tenant_id;

  -- Create user profile with the new tenant as default
  INSERT INTO public.user_profiles (id, display_name, default_tenant_id)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    tenant_id
  );

  -- Add user as admin of their personal tenant
  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  VALUES (tenant_id, NEW.id, 'admin');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user sign-ups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FUNCTION: Get JWT claims for authorization
-- ============================================================================
-- Returns the custom claims to be included in the JWT token
CREATE OR REPLACE FUNCTION public.get_jwt_claims()
RETURNS JSON AS $$
BEGIN
  RETURN public.get_custom_claims(auth.uid());
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- HELPER FUNCTIONS: Role-based checks
-- ============================================================================
-- These functions help check permissions in the application

CREATE OR REPLACE FUNCTION public.is_tenant_admin(tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = is_tenant_admin.tenant_id
    AND user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.is_tenant_editor(tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = is_tenant_editor.tenant_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.is_tenant_member(tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = is_tenant_member.tenant_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- FUNCTION: Get user's current role in a tenant
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_role(tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.tenant_members
  WHERE tenant_id = get_user_role.tenant_id
  AND user_id = auth.uid();

  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON FUNCTION public.get_custom_claims IS
  'Returns custom JWT claims (tenant_id, role, tenant_ids) for the authenticated user';

COMMENT ON FUNCTION public.handle_new_user IS
  'Trigger function that creates a personal tenant and profile for newly signed up users';

COMMENT ON FUNCTION public.is_tenant_admin IS
  'Check if the current user is an admin in the specified tenant';

COMMENT ON FUNCTION public.is_tenant_editor IS
  'Check if the current user is an editor or admin in the specified tenant';

COMMENT ON FUNCTION public.is_tenant_member IS
  'Check if the current user is a member of the specified tenant';

COMMENT ON FUNCTION public.get_user_role IS
  'Get the current user''s role in a specified tenant';

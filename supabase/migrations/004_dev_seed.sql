-- Phase 1: Development Seed Data
-- This file contains seed data for local development and testing
-- NOTE: This should only be run in development environments, NEVER in production

-- ============================================================================
-- WARNING: Development Only
-- ============================================================================
-- This script creates test data for development. Do not run in production!
-- Test users have predictable credentials and should be deleted before launch.

-- ============================================================================
-- HELPER FUNCTION: Create test user and tenant
-- ============================================================================
-- Note: In Supabase, we cannot directly insert into auth.users from SQL.
-- Instead, we provide this as documentation. Users should be created via:
-- 1. Supabase UI Dashboard
-- 2. Supabase Auth API (signUp endpoint)
-- 3. Supabase Admin API (create user endpoint)

-- Recommended test users to create manually:
-- Email: test@example.com
-- Password: TestPassword123!
--
-- Email: developer@example.com
-- Password: DevPassword456!

-- ============================================================================
-- SAMPLE DATA FOR TESTING (if users exist)
-- ============================================================================
-- These queries are provided as examples and should be run after
-- creating test users in the Supabase Dashboard or via the API.

-- Example: If a user with email 'test@example.com' exists with ID:
-- SELECT id FROM auth.users WHERE email = 'test@example.com'
-- Then you could manually create additional tenants like:

-- INSERT INTO public.tenants (name, slug) VALUES
-- ('ACME Corporation', 'acme-corp'),
-- ('Tech Startup Inc', 'tech-startup'),
-- ('Freelance Studio', 'freelance-studio')
-- ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DEVELOPMENT
-- ============================================================================
-- To properly seed development data:
--
-- 1. Create test users in Supabase Dashboard (Authentication > Users):
--    - test@example.com / TestPassword123!
--    - developer@example.com / DevPassword456!
--    - admin@example.com / AdminPassword789!
--
-- 2. Enable TOTP MFA in Auth settings (if not already enabled)
--
-- 3. Run the migration files (001, 002, 003) which will:
--    - Create tables
--    - Enable RLS
--    - Create triggers (automatic tenant creation on signup)
--
-- 4. When users sign up, they will automatically get:
--    - A personal tenant created
--    - A user profile created
--    - Added as admin to their personal tenant
--
-- 5. To add more tenants or members, use the Supabase Dashboard or
--    the application UI after Phase 1 is complete.
--
-- For automated testing, use:
-- - Supabase Admin API (with service_role key)
-- - Seed scripts in test files
-- - PostMan/Insomnia collections

COMMENT ON SCHEMA public IS
  'Phase 1 development seed data. Schema migrations auto-create tenants for new users.';

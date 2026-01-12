/**
 * Authentication and Multi-tenancy Types
 * Defines TypeScript interfaces for auth-related data structures
 */

import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * User role in a tenant
 */
export type UserRole = "admin" | "editor" | "viewer";

/**
 * Extended Supabase user type
 * Uses intersection to avoid conflicts with Supabase User interface
 */
export type AuthUser = SupabaseUser & {
  // App metadata will be handled by Supabase User type
};

/**
 * User profile information (from user_profiles table)
 */
export interface UserProfile {
  id: string; // UUID, same as auth.users.id
  display_name: string;
  default_tenant_id: string | null; // UUID
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/**
 * Tenant (organization/workspace)
 */
export interface Tenant {
  id: string; // UUID
  name: string;
  slug: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  deleted_at: string | null; // ISO 8601
}

/**
 * Tenant membership with role
 */
export interface TenantMember {
  id: string; // UUID
  tenant_id: string; // UUID
  user_id: string; // UUID
  role: UserRole;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/**
 * MFA backup code (hashed for security)
 */
export interface MFABackupCode {
  id: string; // UUID
  user_id: string; // UUID
  code_hash: string; // bcrypt hash
  used_at: string | null; // ISO 8601, null if unused
  created_at: string; // ISO 8601
}

/**
 * Custom JWT claims added by Supabase
 */
export interface JWTClaims {
  tenant_id: string | null; // UUID of current/default tenant
  role: UserRole; // User's role in current tenant
  tenant_ids: string[]; // Array of UUIDs for all tenants user belongs to
  sub: string; // Subject (user ID)
  aud: string; // Audience
  iat: number; // Issued at
  exp: number; // Expiration
}

/**
 * Session information
 */
export interface AuthSession {
  user: AuthUser | null;
  session: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  } | null;
}

/**
 * Auth context type
 */
export interface AuthContextType {
  // State
  user: AuthUser | null;
  userProfile: UserProfile | null;
  currentTenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth methods
  login(email: string, password: string, mfaCode?: string): Promise<void>;
  loginWithBackupCode(email: string, password: string, backupCode: string): Promise<void>;
  register(email: string, password: string, displayName: string): Promise<void>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;

  // Tenant methods
  switchTenant(tenantId: string): Promise<void>;
  createTenant(name: string): Promise<Tenant>;
}

/**
 * Auth error types
 */
export enum AuthErrorCode {
  // Auth errors
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  EMAIL_NOT_CONFIRMED = "EMAIL_NOT_CONFIRMED",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",

  // MFA errors
  MFA_REQUIRED = "MFA_REQUIRED",
  INVALID_MFA_CODE = "INVALID_MFA_CODE",
  INVALID_BACKUP_CODE = "INVALID_BACKUP_CODE",
  BACKUP_CODE_ALREADY_USED = "BACKUP_CODE_ALREADY_USED",

  // Session errors
  SESSION_EXPIRED = "SESSION_EXPIRED",
  INVALID_TOKEN = "INVALID_TOKEN",

  // Tenant errors
  TENANT_NOT_FOUND = "TENANT_NOT_FOUND",
  INVALID_TENANT_SLUG = "INVALID_TENANT_SLUG",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Network errors
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",

  // Generic errors
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Auth error
 */
export interface AuthError extends Error {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

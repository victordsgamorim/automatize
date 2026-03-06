/**
 * Authentication and Multi-tenancy Zod Schemas
 * Runtime validation for auth inputs and data structures
 */

import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

/**
 * Password validation schema
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^a-zA-Z0-9]/,
    'Password must contain at least one special character'
  );

/**
 * Display name validation schema
 */
export const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(255, 'Display name must be 255 characters or less')
  .trim();

/**
 * TOTP code validation schema (6 digits)
 */
export const totpCodeSchema = z
  .string()
  .length(6, 'TOTP code must be exactly 6 digits')
  .regex(/^\d+$/, 'TOTP code must contain only numbers');

/**
 * Backup code validation schema (8 characters)
 */
export const backupCodeSchema = z
  .string()
  .length(8, 'Backup code must be exactly 8 characters')
  .regex(
    /^[A-Z0-9]+$/,
    'Backup code must contain only uppercase letters and numbers'
  );

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  mfaCode: totpCodeSchema.optional(),
  backupCode: backupCodeSchema.optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Login with backup code validation schema
 */
export const loginWithBackupCodeSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  backupCode: backupCodeSchema,
});

export type LoginWithBackupCodeInput = z.infer<
  typeof loginWithBackupCodeSchema
>;

/**
 * Registration form validation schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  passwordConfirm: z.string().min(1, 'Password confirmation is required'),
  displayName: displayNameSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Password reset request validation schema
 */
export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

export type ResetPasswordRequestInput = z.infer<
  typeof resetPasswordRequestSchema
>;

/**
 * Password reset validation schema
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Update password validation schema
 */
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    newPasswordConfirm: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: 'New passwords do not match',
    path: ['newPasswordConfirm'],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

/**
 * MFA setup verification schema
 */
export const mfaSetupSchema = z.object({
  totpCode: totpCodeSchema,
  backupCodesSaved: z.boolean().refine((val) => val === true, {
    message: 'You must confirm that you have saved your backup codes',
  }),
});

export type MFASetupInput = z.infer<typeof mfaSetupSchema>;

/**
 * MFA challenge verification schema
 */
export const mfaChallengeSchema = z
  .object({
    totpCode: totpCodeSchema.optional(),
    backupCode: backupCodeSchema.optional(),
  })
  .refine((data) => data.totpCode || data.backupCode, {
    message: 'Either TOTP code or backup code is required',
    path: ['totpCode'],
  });

export type MFAChallengeInput = z.infer<typeof mfaChallengeSchema>;

/**
 * Tenant slug validation schema
 * - Lowercase letters, numbers, and hyphens
 * - Must start and end with letter or number
 * - 3-63 characters
 */
export const tenantSlugSchema = z
  .string()
  .toLowerCase()
  .trim()
  .min(3, 'Slug must be at least 3 characters')
  .max(63, 'Slug must be at most 63 characters')
  .regex(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
    'Slug must contain only lowercase letters, numbers, and hyphens, and must start and end with a letter or number'
  );

/**
 * Tenant name validation schema
 */
export const tenantNameSchema = z
  .string()
  .min(1, 'Tenant name is required')
  .max(255, 'Tenant name must be 255 characters or less')
  .trim();

/**
 * Create tenant validation schema
 */
export const createTenantSchema = z.object({
  name: tenantNameSchema,
  slug: tenantSlugSchema.optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

/**
 * User role validation schema
 */
export const userRoleSchema = z.enum(['admin', 'editor', 'viewer']);

export type UserRole = z.infer<typeof userRoleSchema>;

/**
 * Add tenant member validation schema
 */
export const addTenantMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: userRoleSchema,
});

export type AddTenantMemberInput = z.infer<typeof addTenantMemberSchema>;

/**
 * Update tenant member role validation schema
 */
export const updateTenantMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: userRoleSchema,
});

export type UpdateTenantMemberInput = z.infer<typeof updateTenantMemberSchema>;

/**
 * JWT claims validation schema
 */
export const jwtClaimsSchema = z.object({
  tenant_id: z.string().uuid().nullable(),
  role: userRoleSchema,
  tenant_ids: z.array(z.string().uuid()),
  sub: z.string().uuid(),
  aud: z.string(),
  iat: z.number(),
  exp: z.number(),
});

export type JWTClaims = z.infer<typeof jwtClaimsSchema>;

/**
 * User profile validation schema
 */
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: displayNameSchema,
  default_tenant_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * Tenant validation schema
 */
export const tenantSchema = z.object({
  id: z.string().uuid(),
  name: tenantNameSchema,
  slug: tenantSlugSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
});

export type Tenant = z.infer<typeof tenantSchema>;

/**
 * Tenant member validation schema
 */
export const tenantMemberSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: userRoleSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TenantMember = z.infer<typeof tenantMemberSchema>;

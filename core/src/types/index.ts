/**
 * Core TypeScript types and interfaces
 */

import { z } from 'zod';

/**
 * Base entity schema with common fields
 */
export const baseEntitySchema = z.object({
  id: z.string().ulid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
  version: z.number().int().nonnegative(),
  tenantId: z.string().ulid(),
});

export type BaseEntity = z.infer<typeof baseEntitySchema>;

/**
 * User roles for RBAC
 */
export const UserRole = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const userRoleSchema = z.enum(['admin', 'editor', 'viewer']);

/**
 * User Domain Entity
 * Represents a user with business rules and permissions
 */

import { z } from "zod";

/**
 * User role type
 */
export type UserRole = "admin" | "editor" | "viewer";

/**
 * User domain schema
 * Enforces business rules at the domain level
 */
const userDomainSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email("Invalid email address").toLowerCase(),
  displayName: z
    .string()
    .min(1, "Display name cannot be empty")
    .max(255, "Display name must be 255 characters or less")
    .trim(),
  defaultTenantId: z.string().uuid().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserData = z.infer<typeof userDomainSchema>;

/**
 * User domain entity
 */
export class User {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly defaultTenantId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(data: UserData) {
    const validated = userDomainSchema.parse(data);
    this.id = validated.id;
    this.email = validated.email;
    this.displayName = validated.displayName;
    this.defaultTenantId = validated.defaultTenantId ?? null;
    this.createdAt = validated.createdAt;
    this.updatedAt = validated.updatedAt;
  }

  /**
   * Get display name
   */
  getDisplayName(): string {
    return this.displayName;
  }

  /**
   * Get email (with PII handling for logging)
   */
  getEmailHash(): string {
    // Return first part only for safer logging
    const [localPart] = this.email.split("@");
    return localPart ? `${localPart}@...` : "[REDACTED]";
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate display name
   */
  static isValidDisplayName(name: string): boolean {
    return name.trim().length > 0 && name.length <= 255;
  }
}

/**
 * User role permissions
 */
export const rolePermissions: Record<UserRole, Set<string>> = {
  admin: new Set([
    "read:*",
    "create:*",
    "update:*",
    "delete:*",
    "manage:members",
    "manage:settings",
  ]),
  editor: new Set([
    "read:*",
    "create:invoices",
    "create:products",
    "create:clients",
    "update:invoices",
    "update:products",
    "update:clients",
    "delete:own", // Can only delete own records
  ]),
  viewer: new Set([
    "read:*",
  ]),
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;

  // Check exact match
  if (permissions.has(permission)) return true;

  // Check wildcard match - user permissions can have wildcards
  const [requestedResource, requestedAction] = permission.split(":");

  // Check if user has "resource:*" permission
  if (permissions.has(`${requestedResource}:*`)) return true;

  // Check if user has "*:action" permission
  if (permissions.has(`*:${requestedAction}`)) return true;

  // Check if user has full wildcard "*"
  if (permissions.has("*")) return true;

  return false;
}

/**
 * Check multiple permissions (all must be true)
 */
export function hasAllPermissions(role: UserRole, permissions: string[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check multiple permissions (at least one must be true)
 */
export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Factory function to create a new user
 */
export function createUser(
  id: string,
  email: string,
  displayName: string,
  defaultTenantId?: string,
  now: Date = new Date()
): User {
  return new User({
    id,
    email: email.toLowerCase(),
    displayName: displayName.trim(),
    defaultTenantId: defaultTenantId ?? null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });
}

/**
 * Tenant Domain Entity
 * Represents an organization/workspace with business rules
 */

import { z } from "zod";

/**
 * Tenant domain schema
 * Enforces business rules at the domain level
 */
const tenantDomainSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, "Tenant name cannot be empty")
    .max(255, "Tenant name must be 255 characters or less")
    .trim(),
  slug: z
    .string()
    .toLowerCase()
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

export type TenantData = z.infer<typeof tenantDomainSchema>;

/**
 * Tenant domain entity
 */
export class Tenant {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;

  constructor(data: TenantData) {
    const validated = tenantDomainSchema.parse(data);
    this.id = validated.id;
    this.name = validated.name;
    this.slug = validated.slug;
    this.createdAt = validated.createdAt;
    this.updatedAt = validated.updatedAt;
    this.deletedAt = validated.deletedAt ?? null;
  }

  /**
   * Check if tenant is deleted (soft delete)
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Generate slug from name
   * Converts to lowercase, removes special characters, replaces spaces with hyphens
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Validate slug format
   */
  static isValidSlug(slug: string): boolean {
    return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug);
  }

  /**
   * Validate tenant name
   */
  static isValidName(name: string): boolean {
    return name.trim().length > 0 && name.length <= 255;
  }
}

/**
 * Factory function to create a new tenant
 */
export function createTenant(
  id: string,
  name: string,
  slug: string,
  now: Date = new Date()
): Tenant {
  return new Tenant({
    id,
    name: name.trim(),
    slug: slug.toLowerCase(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    deletedAt: null,
  });
}

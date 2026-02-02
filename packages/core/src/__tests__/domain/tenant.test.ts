/**
 * Tenant Domain Tests
 */

import { describe, it, expect } from 'vitest';
import { Tenant, createTenant } from '../../domain/tenant';

describe('Tenant Domain', () => {
  describe('Tenant entity', () => {
    it('should create a valid tenant', () => {
      const tenant = new Tenant({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'ACME Corporation',
        slug: 'acme-corp',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      });

      expect(tenant.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(tenant.name).toBe('ACME Corporation');
      expect(tenant.slug).toBe('acme-corp');
    });

    it('should reject invalid tenant data', () => {
      expect(() => {
        new Tenant({
          id: 'invalid-uuid',
          name: 'Test',
          slug: 'test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        });
      }).toThrow();
    });

    it('should trim tenant name', () => {
      const tenant = new Tenant({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '  Test Tenant  ',
        slug: 'test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      });

      // Schema auto-trims the name
      expect(tenant.name).toBe('Test Tenant');
    });

    it('should check if tenant is deleted', () => {
      const activeTenant = new Tenant({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Active',
        slug: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      });

      const deletedTenant = new Tenant({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Deleted',
        slug: 'deleted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
      });

      expect(activeTenant.isDeleted()).toBe(false);
      expect(deletedTenant.isDeleted()).toBe(true);
    });
  });

  describe('Tenant.generateSlug', () => {
    it('should generate valid slug from name', () => {
      expect(Tenant.generateSlug('ACME Corporation')).toBe('acme-corporation');
      expect(Tenant.generateSlug('Tech Startup Inc.')).toBe('tech-startup-inc');
      expect(Tenant.generateSlug('My Company!')).toBe('my-company');
    });

    it('should handle multiple spaces', () => {
      expect(Tenant.generateSlug('Multiple   Spaces   Here')).toBe(
        'multiple-spaces-here'
      );
    });

    it('should remove leading/trailing hyphens', () => {
      expect(Tenant.generateSlug('-Invalid-Name-')).toBe('invalid-name');
    });

    it('should handle edge cases', () => {
      expect(Tenant.generateSlug('123Numbers')).toBe('123numbers');
      expect(Tenant.generateSlug('---')).toBe('');
    });
  });

  describe('Tenant.isValidSlug', () => {
    it('should validate correct slugs', () => {
      expect(Tenant.isValidSlug('valid-slug')).toBe(true);
      expect(Tenant.isValidSlug('slug123')).toBe(true);
      expect(Tenant.isValidSlug('a')).toBe(true);
      expect(Tenant.isValidSlug('test-123-slug')).toBe(true);
    });

    it('should reject invalid slugs', () => {
      expect(Tenant.isValidSlug('-invalid')).toBe(false);
      expect(Tenant.isValidSlug('invalid-')).toBe(false);
      expect(Tenant.isValidSlug('UPPERCASE')).toBe(false);
      expect(Tenant.isValidSlug('invalid slug')).toBe(false);
      expect(Tenant.isValidSlug('invalid_slug')).toBe(false);
      expect(Tenant.isValidSlug('')).toBe(false);
    });
  });

  describe('Tenant.isValidName', () => {
    it('should validate correct names', () => {
      expect(Tenant.isValidName('Valid Name')).toBe(true);
      expect(Tenant.isValidName('A')).toBe(true);
      expect(Tenant.isValidName('123')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(Tenant.isValidName('')).toBe(false);
      expect(Tenant.isValidName('   ')).toBe(false);
      expect(Tenant.isValidName('a'.repeat(256))).toBe(false);
    });
  });

  describe('createTenant factory', () => {
    it('should create a new tenant with defaults', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      const tenant = createTenant(
        '550e8400-e29b-41d4-a716-446655440000',
        'Test Tenant',
        'test-tenant',
        now
      );

      expect(tenant.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(tenant.name).toBe('Test Tenant');
      expect(tenant.slug).toBe('test-tenant');
      expect(tenant.createdAt).toBe(now.toISOString());
      expect(tenant.updatedAt).toBe(now.toISOString());
      expect(tenant.deletedAt).toBeNull();
    });
  });
});

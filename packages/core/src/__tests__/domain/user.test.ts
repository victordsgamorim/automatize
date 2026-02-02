/**
 * User Domain Tests
 */

import { describe, it, expect } from 'vitest';
import {
  User,
  createUser,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
} from '../../domain/user';

describe('User Domain', () => {
  describe('User entity', () => {
    it('should create a valid user', () => {
      const user = new User({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        displayName: 'Test User',
        defaultTenantId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expect(user.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(user.email).toBe('test@example.com');
      expect(user.displayName).toBe('Test User');
      expect(user.defaultTenantId).toBeNull();
    });

    it('should normalize email to lowercase', () => {
      const user = new User({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'TEST@EXAMPLE.COM',
        displayName: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expect(user.email).toBe('test@example.com');
    });

    it('should reject invalid user data', () => {
      expect(() => {
        new User({
          id: 'invalid-uuid',
          email: 'test@example.com',
          displayName: 'Test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }).toThrow();
    });

    it('should get display name', () => {
      const user = new User({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        displayName: 'John Doe',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expect(user.getDisplayName()).toBe('John Doe');
    });

    it('should hash email for safe logging', () => {
      const user = new User({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john.doe@example.com',
        displayName: 'John',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const hash = user.getEmailHash();
      expect(hash).toBe('john.doe@...');
      expect(hash).not.toContain('example.com');
    });
  });

  describe('User.isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(User.isValidEmail('test@example.com')).toBe(true);
      expect(User.isValidEmail('john.doe@company.co.uk')).toBe(true);
      expect(User.isValidEmail('user+tag@domain.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(User.isValidEmail('invalid')).toBe(false);
      expect(User.isValidEmail('@example.com')).toBe(false);
      expect(User.isValidEmail('user@')).toBe(false);
      expect(User.isValidEmail('user@.com')).toBe(false);
    });
  });

  describe('User.isValidDisplayName', () => {
    it('should validate correct display names', () => {
      expect(User.isValidDisplayName('John Doe')).toBe(true);
      expect(User.isValidDisplayName('A')).toBe(true);
      expect(User.isValidDisplayName('User 123')).toBe(true);
    });

    it('should reject invalid display names', () => {
      expect(User.isValidDisplayName('')).toBe(false);
      expect(User.isValidDisplayName('   ')).toBe(false);
      expect(User.isValidDisplayName('a'.repeat(256))).toBe(false);
    });
  });

  describe('Role-based permissions', () => {
    it('should grant admin all permissions', () => {
      expect(hasPermission('admin', 'read:invoices')).toBe(true);
      expect(hasPermission('admin', 'create:products')).toBe(true);
      expect(hasPermission('admin', 'delete:clients')).toBe(true);
      expect(hasPermission('admin', 'manage:members')).toBe(true);
    });

    it('should grant editor limited permissions', () => {
      expect(hasPermission('editor', 'read:invoices')).toBe(true);
      expect(hasPermission('editor', 'create:invoices')).toBe(true);
      expect(hasPermission('editor', 'update:products')).toBe(true);
      expect(hasPermission('editor', 'delete:clients')).toBe(false);
      expect(hasPermission('editor', 'manage:members')).toBe(false);
    });

    it('should grant viewer read-only permissions', () => {
      expect(hasPermission('viewer', 'read:invoices')).toBe(true);
      expect(hasPermission('viewer', 'create:invoices')).toBe(false);
      expect(hasPermission('viewer', 'delete:clients')).toBe(false);
      expect(hasPermission('viewer', 'manage:members')).toBe(false);
    });

    it('should check multiple permissions with hasAllPermissions', () => {
      expect(
        hasAllPermissions('admin', [
          'read:invoices',
          'create:products',
          'manage:members',
        ])
      ).toBe(true);

      expect(
        hasAllPermissions('editor', [
          'read:invoices',
          'create:invoices',
          'manage:members', // editor doesn't have this
        ])
      ).toBe(false);
    });

    it('should check multiple permissions with hasAnyPermission', () => {
      expect(
        hasAnyPermission('editor', [
          'manage:members', // doesn't have
          'create:invoices', // has this
          'delete:clients', // doesn't have
        ])
      ).toBe(true);

      expect(
        hasAnyPermission('viewer', [
          'create:invoices', // doesn't have
          'manage:members', // doesn't have
        ])
      ).toBe(false);
    });
  });

  describe('createUser factory', () => {
    it('should create a new user with defaults', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      const user = createUser(
        '550e8400-e29b-41d4-a716-446655440000',
        'TEST@EXAMPLE.COM',
        '  Test User  ',
        undefined,
        now
      );

      expect(user.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(user.email).toBe('test@example.com');
      expect(user.displayName).toBe('Test User');
      expect(user.defaultTenantId).toBeNull();
      expect(user.createdAt).toBe(now.toISOString());
    });

    it('should create a user with default tenant', () => {
      const user = createUser(
        '550e8400-e29b-41d4-a716-446655440000',
        'test@example.com',
        'Test User',
        '550e8400-e29b-41d4-a716-446655440001'
      );

      expect(user.defaultTenantId).toBe('550e8400-e29b-41d4-a716-446655440001');
    });
  });
});

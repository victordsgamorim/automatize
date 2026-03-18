import { describe, expect, it } from 'vitest';

import { loginSchema } from './loginSchema';

describe('loginSchema', () => {
  describe('valid inputs', () => {
    it('accepts a valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'secret',
      });
      expect(result.success).toBe(true);
    });

    it('lowercases the email', () => {
      const result = loginSchema.safeParse({
        email: 'User@Example.COM',
        password: 'secret',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('accepts a single-character password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'x',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('rejects an invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'secret',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('rejects an empty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'secret',
      });
      expect(result.success).toBe(false);
    });

    it('rejects an empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required');
      }
    });

    it('rejects missing email field', () => {
      const result = loginSchema.safeParse({ password: 'secret' });
      expect(result.success).toBe(false);
    });

    it('rejects missing password field', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com' });
      expect(result.success).toBe(false);
    });

    it('rejects an empty object', () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

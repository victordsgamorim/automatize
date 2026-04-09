import { describe, it, expect } from 'vitest';
import { emailSchema } from '../../src/validators/email';

describe('emailSchema', () => {
  it('accepts a valid email', () => {
    expect(emailSchema.parse('user@example.com')).toBe('user@example.com');
  });

  it('transforms to lowercase', () => {
    expect(emailSchema.parse('User@Example.COM')).toBe('user@example.com');
  });

  it('trims whitespace', () => {
    expect(emailSchema.parse('  user@example.com  ')).toBe('user@example.com');
  });

  it('rejects invalid email', () => {
    expect(() => emailSchema.parse('not-an-email')).toThrow();
  });

  it('rejects empty string', () => {
    expect(() => emailSchema.parse('')).toThrow();
  });
});

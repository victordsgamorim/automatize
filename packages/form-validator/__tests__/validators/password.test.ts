import { describe, it, expect } from 'vitest';
import { passwordSchema } from '../../src/validators/password';

describe('passwordSchema', () => {
  it('accepts a non-empty string', () => {
    expect(passwordSchema.parse('secret')).toBe('secret');
  });

  it('accepts a single character', () => {
    expect(passwordSchema.parse('x')).toBe('x');
  });

  it('rejects empty string', () => {
    expect(() => passwordSchema.parse('')).toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import { nameSchema } from '../../src/validators/name';

describe('nameSchema', () => {
  it('accepts a valid name', () => {
    expect(nameSchema.parse('John Doe')).toBe('John Doe');
  });

  it('trims whitespace', () => {
    expect(nameSchema.parse('  John  ')).toBe('John');
  });

  it('rejects empty string', () => {
    expect(() => nameSchema.parse('')).toThrow();
  });

  it('rejects whitespace-only string', () => {
    expect(() => nameSchema.parse('   ')).toThrow();
  });
});

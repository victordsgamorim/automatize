import { describe, it, expect } from 'vitest';
import { phoneSchema } from '../../src/validators/phone';

describe('phoneSchema', () => {
  it('accepts 10-digit landline', () => {
    expect(phoneSchema.parse('1134567890')).toBe('1134567890');
  });

  it('accepts 11-digit mobile', () => {
    expect(phoneSchema.parse('11987654321')).toBe('11987654321');
  });

  it('strips non-digit characters', () => {
    expect(phoneSchema.parse('(11) 98765-4321')).toBe('11987654321');
  });

  it('rejects too short', () => {
    expect(() => phoneSchema.parse('123456789')).toThrow();
  });

  it('rejects too long', () => {
    expect(() => phoneSchema.parse('123456789012')).toThrow();
  });

  it('rejects empty string', () => {
    expect(() => phoneSchema.parse('')).toThrow();
  });
});

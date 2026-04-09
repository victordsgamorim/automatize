import { describe, it, expect } from 'vitest';
import { formatPhone } from '../../src/formatters/phone';

describe('formatPhone', () => {
  it('formats 11-digit mobile number', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('formats 10-digit landline number', () => {
    expect(formatPhone('1134567890')).toBe('(11) 3456-7890');
  });

  it('formats partial input progressively', () => {
    expect(formatPhone('11')).toBe('11');
    expect(formatPhone('119')).toBe('(11) 9');
    expect(formatPhone('11987')).toBe('(11) 987');
    expect(formatPhone('1198765')).toBe('(11) 9876-5');
    expect(formatPhone('1134567890')).toBe('(11) 3456-7890');
  });

  it('strips non-digit characters', () => {
    expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
  });

  it('truncates input longer than 11 digits', () => {
    expect(formatPhone('119876543219')).toBe('(11) 98765-4321');
  });

  it('handles empty string', () => {
    expect(formatPhone('')).toBe('');
  });
});

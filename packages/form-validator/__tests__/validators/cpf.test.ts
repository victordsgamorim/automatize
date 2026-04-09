import { describe, it, expect } from 'vitest';
import { cpfSchema, isValidCpf } from '../../src/validators/cpf';

describe('isValidCpf', () => {
  it('validates a known valid CPF', () => {
    expect(isValidCpf('52998224725')).toBe(true);
  });

  it('validates formatted CPF', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  it('rejects all-same-digit CPF', () => {
    expect(isValidCpf('11111111111')).toBe(false);
    expect(isValidCpf('00000000000')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidCpf('1234567890')).toBe(false);
    expect(isValidCpf('123456789012')).toBe(false);
  });

  it('rejects invalid checksum', () => {
    expect(isValidCpf('52998224726')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidCpf('')).toBe(false);
  });
});

describe('cpfSchema', () => {
  it('parses and strips non-digits', () => {
    const result = cpfSchema.parse('529.982.247-25');
    expect(result).toBe('52998224725');
  });

  it('throws on invalid CPF', () => {
    expect(() => cpfSchema.parse('000.000.000-00')).toThrow();
  });
});

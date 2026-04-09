import { describe, it, expect } from 'vitest';
import { cnpjSchema, isValidCnpj } from '../../src/validators/cnpj';

describe('isValidCnpj', () => {
  it('validates a known valid CNPJ', () => {
    expect(isValidCnpj('11222333000181')).toBe(true);
  });

  it('validates formatted CNPJ', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
  });

  it('rejects all-same-digit CNPJ', () => {
    expect(isValidCnpj('11111111111111')).toBe(false);
    expect(isValidCnpj('00000000000000')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidCnpj('1122233300018')).toBe(false);
    expect(isValidCnpj('112223330001811')).toBe(false);
  });

  it('rejects invalid checksum', () => {
    expect(isValidCnpj('11222333000182')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidCnpj('')).toBe(false);
  });
});

describe('cnpjSchema', () => {
  it('parses and strips non-digits', () => {
    const result = cnpjSchema.parse('11.222.333/0001-81');
    expect(result).toBe('11222333000181');
  });

  it('throws on invalid CNPJ', () => {
    expect(() => cnpjSchema.parse('00.000.000/0000-00')).toThrow();
  });
});

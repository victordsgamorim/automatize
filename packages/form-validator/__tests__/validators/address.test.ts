import { describe, it, expect } from 'vitest';
import { addressSchema } from '../../src/validators/address';

const validAddress = {
  street: 'Rua das Flores',
  number: '123',
  neighborhood: 'Centro',
  city: 'Sao Paulo',
  state: 'SP',
  info: 'Apt 4B',
};

describe('addressSchema', () => {
  it('accepts a complete address', () => {
    const result = addressSchema.parse(validAddress);
    expect(result.street).toBe('Rua das Flores');
    expect(result.info).toBe('Apt 4B');
  });

  it('info defaults to empty string when omitted', () => {
    const { info: _info, ...withoutInfo } = validAddress;
    const result = addressSchema.parse(withoutInfo);
    expect(result.info).toBe('');
  });

  it('rejects missing street', () => {
    const { street: _street, ...rest } = validAddress;
    expect(() => addressSchema.parse(rest)).toThrow();
  });

  it('rejects missing number', () => {
    const { number: _number, ...rest } = validAddress;
    expect(() => addressSchema.parse(rest)).toThrow();
  });

  it('rejects missing city', () => {
    const { city: _city, ...rest } = validAddress;
    expect(() => addressSchema.parse(rest)).toThrow();
  });

  it('rejects empty state', () => {
    expect(() => addressSchema.parse({ ...validAddress, state: '' })).toThrow();
  });

  it('trims whitespace from fields', () => {
    const result = addressSchema.parse({
      ...validAddress,
      street: '  Rua das Flores  ',
    });
    expect(result.street).toBe('Rua das Flores');
  });
});

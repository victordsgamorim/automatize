import { describe, it, expect } from 'vitest';
import { formatCnpj } from '../../src/formatters/cnpj';

describe('formatCnpj', () => {
  it('formats full 14 digits', () => {
    expect(formatCnpj('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('formats partial input progressively', () => {
    expect(formatCnpj('11')).toBe('11');
    expect(formatCnpj('112')).toBe('11.2');
    expect(formatCnpj('11222')).toBe('11.222');
    expect(formatCnpj('112223')).toBe('11.222.3');
    expect(formatCnpj('11222333')).toBe('11.222.333');
    expect(formatCnpj('112223330')).toBe('11.222.333/0');
    expect(formatCnpj('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('strips non-digit characters', () => {
    expect(formatCnpj('11.222.333/0001-81')).toBe('11.222.333/0001-81');
  });

  it('truncates input longer than 14 digits', () => {
    expect(formatCnpj('1122233300018199')).toBe('11.222.333/0001-81');
  });

  it('handles empty string', () => {
    expect(formatCnpj('')).toBe('');
  });
});

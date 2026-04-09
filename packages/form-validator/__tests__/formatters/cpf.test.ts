import { describe, it, expect } from 'vitest';
import { formatCpf } from '../../src/formatters/cpf';

describe('formatCpf', () => {
  it('formats full 11 digits', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
  });

  it('formats partial input progressively', () => {
    expect(formatCpf('529')).toBe('529');
    expect(formatCpf('5299')).toBe('529.9');
    expect(formatCpf('529982')).toBe('529.982');
    expect(formatCpf('5299822')).toBe('529.982.2');
    expect(formatCpf('529982247')).toBe('529.982.247');
    expect(formatCpf('5299822472')).toBe('529.982.247-2');
  });

  it('strips non-digit characters', () => {
    expect(formatCpf('529.982.247-25')).toBe('529.982.247-25');
  });

  it('truncates input longer than 11 digits', () => {
    expect(formatCpf('529982247251234')).toBe('529.982.247-25');
  });

  it('handles empty string', () => {
    expect(formatCpf('')).toBe('');
  });
});

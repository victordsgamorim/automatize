import { describe, it, expect } from 'vitest';

import { cn } from '../utils';

describe('cn', () => {
  it('returns an empty string when called with no arguments', () => {
    expect(cn()).toBe('');
  });

  it('joins two class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignores falsy values (undefined, null, false)', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar');
  });

  it('handles conditional object syntax — includes truthy keys', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('handles array syntax', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles nested arrays and objects', () => {
    expect(cn(['foo', { bar: true }], 'baz')).toBe('foo bar baz');
  });

  // tailwind-merge conflict resolution
  it('resolves conflicting Tailwind padding utilities (last wins)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('resolves conflicting Tailwind text-color utilities (last wins)', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('resolves partial conflicts — keeps non-conflicting utilities', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('deduplicates identical Tailwind utilities', () => {
    expect(cn('p-4', 'p-4')).toBe('p-4');
  });

  it('preserves non-conflicting classes from both arguments', () => {
    expect(cn('flex items-center', 'gap-2 font-bold')).toBe(
      'flex items-center gap-2 font-bold'
    );
  });
});

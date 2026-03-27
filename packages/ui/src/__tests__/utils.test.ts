import { describe, it, expect } from 'vitest';

import { cn, sharedBreakpoints } from '../utils';

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

describe('sharedBreakpoints', () => {
  // ── triggerContainer ──────────────────────────────────────────────────────

  it('triggerContainer collapses to a fixed square width on mobile via w-[38px]', () => {
    expect(sharedBreakpoints.triggerContainer).toContain('w-[38px]');
  });

  it('triggerContainer removes horizontal padding on mobile via px-0', () => {
    expect(sharedBreakpoints.triggerContainer).toContain('px-0');
  });

  it('triggerContainer centers content on mobile via justify-center', () => {
    expect(sharedBreakpoints.triggerContainer).toContain('justify-center');
  });

  it('triggerContainer restores auto width above mobile breakpoint via sm:w-auto', () => {
    expect(sharedBreakpoints.triggerContainer).toContain('sm:w-auto');
  });

  it('triggerContainer restores horizontal padding above mobile breakpoint via sm:px-3', () => {
    expect(sharedBreakpoints.triggerContainer).toContain('sm:px-3');
  });

  it('triggerContainer aligns content left above mobile breakpoint via sm:justify-start', () => {
    expect(sharedBreakpoints.triggerContainer).toContain('sm:justify-start');
  });

  it('triggerContainer applies minimum width only above mobile breakpoint via sm:min-w-[180px]', () => {
    expect(sharedBreakpoints.triggerContainer).toContain('sm:min-w-[180px]');
    expect(sharedBreakpoints.triggerContainer).not.toMatch(
      /(^| )min-w-\[180px\]/
    );
  });

  // ── triggerText ───────────────────────────────────────────────────────────

  it('triggerText hides label on mobile via hidden', () => {
    expect(sharedBreakpoints.triggerText).toContain('hidden');
  });

  it('triggerText shows label above mobile breakpoint via sm:inline', () => {
    expect(sharedBreakpoints.triggerText).toContain('sm:inline');
  });

  it('triggerText truncates overflowing text', () => {
    expect(sharedBreakpoints.triggerText).toContain('truncate');
  });

  // ── triggerKbd ────────────────────────────────────────────────────────────

  it('triggerKbd hides keyboard badge on mobile via hidden', () => {
    expect(sharedBreakpoints.triggerKbd).toContain('hidden');
  });

  it('triggerKbd shows keyboard badge above mobile breakpoint via sm:inline-flex', () => {
    expect(sharedBreakpoints.triggerKbd).toContain('sm:inline-flex');
  });

  // ── triggerIcon ───────────────────────────────────────────────────────────

  it('triggerIcon prevents icon from shrinking via shrink-0', () => {
    expect(sharedBreakpoints.triggerIcon).toContain('shrink-0');
  });
});

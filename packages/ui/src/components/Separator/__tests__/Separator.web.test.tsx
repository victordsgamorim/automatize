import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import { Separator } from '../Separator.web';

describe('Separator (web)', () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders with data-slot="separator"', () => {
    render(<Separator />);
    expect(document.querySelector('[data-slot="separator"]')).toBeTruthy();
  });

  it('renders horizontal orientation by default', () => {
    render(<Separator />);
    const el = document.querySelector('[data-slot="separator"]') as HTMLElement;
    expect(el.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('renders vertical orientation when specified', () => {
    render(<Separator orientation="vertical" />);
    const el = document.querySelector('[data-slot="separator"]') as HTMLElement;
    expect(el.getAttribute('data-orientation')).toBe('vertical');
  });

  it('applies horizontal CSS classes by default', () => {
    render(<Separator />);
    const el = document.querySelector('[data-slot="separator"]') as HTMLElement;
    expect(el.className).toContain('h-[1px]');
    expect(el.className).toContain('w-full');
  });

  it('applies vertical CSS classes when orientation is vertical', () => {
    render(<Separator orientation="vertical" />);
    const el = document.querySelector('[data-slot="separator"]') as HTMLElement;
    expect(el.className).toContain('h-full');
    expect(el.className).toContain('w-[1px]');
  });

  // ── Decorative ────────────────────────────────────────────────────────────

  it('is decorative by default (role="none")', () => {
    render(<Separator />);
    const el = document.querySelector('[data-slot="separator"]') as HTMLElement;
    expect(el.getAttribute('role')).toBe('none');
  });

  it('renders as non-decorative separator with role="separator"', () => {
    render(<Separator decorative={false} />);
    const el = document.querySelector('[data-slot="separator"]') as HTMLElement;
    expect(el.getAttribute('role')).toBe('separator');
  });

  // ── className ─────────────────────────────────────────────────────────────

  it('applies custom className', () => {
    render(<Separator className="my-separator" />);
    const el = document.querySelector('[data-slot="separator"]') as HTMLElement;
    expect(el.className).toContain('my-separator');
  });

  // ── Ref forwarding ────────────────────────────────────────────────────────

  it('forwards ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Separator ref={ref} />);
    expect(ref.current).toBeDefined();
    expect(ref.current!.getAttribute('data-slot')).toBe('separator');
  });
});

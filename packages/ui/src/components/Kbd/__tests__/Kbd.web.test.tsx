import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import { Kbd } from '../Kbd.web';

describe('Kbd (web)', () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders a kbd element', () => {
    render(<Kbd>Esc</Kbd>);
    expect(document.querySelector('[data-slot="kbd"]')).toBeTruthy();
  });

  it('renders children as text content', () => {
    render(<Kbd>Esc</Kbd>);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.textContent).toBe('Esc');
  });

  it('renders multiple children', () => {
    render(
      <Kbd>
        <span>Ctrl</span>
        <span>K</span>
      </Kbd>
    );
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.textContent).toBe('CtrlK');
  });

  // ── Styling ───────────────────────────────────────────────────────────────

  it('applies default styling classes', () => {
    render(<Kbd>Enter</Kbd>);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.className).toContain('pointer-events-none');
    expect(el.className).toContain('inline-flex');
    expect(el.className).toContain('select-none');
    expect(el.className).toContain('rounded');
    expect(el.className).toContain('border');
    expect(el.className).toContain('bg-muted');
    expect(el.className).toContain('font-mono');
  });

  it('merges custom className without overriding defaults', () => {
    render(<Kbd className="ml-auto">Esc</Kbd>);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.className).toContain('ml-auto');
    expect(el.className).toContain('pointer-events-none');
  });

  // ── Attributes ────────────────────────────────────────────────────────────

  it('spreads additional HTML attributes', () => {
    render(<Kbd aria-label="Escape key">Esc</Kbd>);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.getAttribute('aria-label')).toBe('Escape key');
  });
});

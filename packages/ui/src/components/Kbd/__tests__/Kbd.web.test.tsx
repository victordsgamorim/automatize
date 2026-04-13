import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import { Kbd } from '../Kbd.web';

describe('Kbd (web)', () => {
  // ── Helpers ──────────────────────────────────────────────────────────────

  type NavWithUAData = Navigator & { userAgentData?: { platform?: string } };

  /** Stub `navigator.userAgent` so the component thinks it's on Windows. */
  function mockWindows() {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true,
    });
    (navigator as NavWithUAData).userAgentData = undefined;
  }

  /** Stub `navigator.userAgent` so the component thinks it's on macOS. */
  function mockMac() {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      configurable: true,
    });
    (navigator as NavWithUAData).userAgentData = undefined;
  }

  beforeEach(() => {
    mockWindows(); // default to Windows
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders a kbd element', () => {
    render(<Kbd keyLabel="Esc" />);
    expect(document.querySelector('[data-slot="kbd"]')).toBeTruthy();
  });

  it('renders only the key when no modifiers are set', () => {
    render(<Kbd keyLabel="Enter" />);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.textContent).toBe('Enter');
  });

  // ── Modifier combinations ────────────────────────────────────────────────

  it('renders Ctrl+Key on Windows when control=true', () => {
    render(<Kbd keyLabel="Enter" control />);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.textContent).toBe('Ctrl+Enter');
  });

  it('renders ⌘+Key on macOS when control=true', () => {
    mockMac();
    render(<Kbd keyLabel="Enter" control />);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.textContent).toBe('⌘+Enter');
  });

  it('renders Ctrl+Shift+Key', () => {
    render(<Kbd keyLabel="Enter" control shift />);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.textContent).toBe('Ctrl+Shift+Enter');
  });

  it('renders Ctrl+Shift+Alt+Key', () => {
    render(<Kbd keyLabel="Enter" control shift alt />);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.textContent).toBe('Ctrl+Shift+Alt+Enter');
  });

  it('renders Shift+Key when only shift=true', () => {
    render(<Kbd keyLabel="S" shift />);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.textContent).toBe('Shift+S');
  });

  it('renders Alt+Key when only alt=true', () => {
    render(<Kbd keyLabel="F4" alt />);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.textContent).toBe('Alt+F4');
  });

  it('renders Ctrl+Alt+Key (no shift)', () => {
    render(<Kbd keyLabel="Delete" control alt />);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.textContent).toBe('Ctrl+Alt+Delete');
  });

  it('renders Shift+Alt+Key (no control)', () => {
    render(<Kbd keyLabel="Tab" shift alt />);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.textContent).toBe('Shift+Alt+Tab');
  });

  // ── Styling ───────────────────────────────────────────────────────────────

  it('applies default styling classes', () => {
    render(<Kbd keyLabel="Enter" />);
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
    render(<Kbd keyLabel="Esc" className="ml-auto" />);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.className).toContain('ml-auto');
    expect(el.className).toContain('pointer-events-none');
  });

  // ── Attributes ────────────────────────────────────────────────────────────

  it('spreads additional HTML attributes', () => {
    render(<Kbd keyLabel="Esc" aria-label="Escape key" />);
    const el = document.querySelector('[data-slot="kbd"]') as HTMLElement;
    expect(el.getAttribute('aria-label')).toBe('Escape key');
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { Header } from '../Header.web';

describe('Header (web)', () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders as a <header> element', () => {
    render(<Header title="Page" />);
    expect(document.querySelector('header')).toBeTruthy();
  });

  it('renders the title text', () => {
    render(<Header title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeDefined();
  });

  it('renders title inside a span with text-xl font-semibold', () => {
    render(<Header title="Settings" />);
    const title = screen.getByText('Settings');
    expect(title.tagName).toBe('SPAN');
    expect(title.className).toContain('text-xl');
    expect(title.className).toContain('font-semibold');
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  it('renders actions slot when provided', () => {
    render(
      <Header
        title="Page"
        actions={<button data-testid="action-btn">Action</button>}
      />
    );
    expect(screen.getByTestId('action-btn')).toBeDefined();
  });

  it('does not render actions container when no actions provided', () => {
    render(<Header title="Page" />);
    const header = document.querySelector('header') as HTMLElement;
    const inner = header.firstElementChild as HTMLElement;
    // Only the title span should be present — no actions wrapper
    expect(inner.children).toHaveLength(1);
  });

  it('renders multiple action elements inside actions slot', () => {
    render(
      <Header
        title="Page"
        actions={
          <>
            <button data-testid="btn-1">A</button>
            <button data-testid="btn-2">B</button>
          </>
        }
      />
    );
    expect(screen.getByTestId('btn-1')).toBeDefined();
    expect(screen.getByTestId('btn-2')).toBeDefined();
  });

  // ── className ─────────────────────────────────────────────────────────────

  it('applies custom className to header element', () => {
    render(<Header title="Page" className="my-header" />);
    const header = document.querySelector('header') as HTMLElement;
    expect(header.className).toContain('my-header');
  });

  it('retains default classes when custom className is applied', () => {
    render(<Header title="Page" className="extra" />);
    const header = document.querySelector('header') as HTMLElement;
    expect(header.className).toContain('sticky');
    expect(header.className).toContain('top-0');
  });
});

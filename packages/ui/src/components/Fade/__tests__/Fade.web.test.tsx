import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { Fade } from '../Fade.web';

describe('Fade (web)', () => {
  it('renders children content', () => {
    render(<Fade visible>Hello</Fade>);
    expect(screen.getByText('Hello')).toBeDefined();
  });

  it('applies opacity-100 when visible', () => {
    render(<Fade visible>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('opacity-100');
    expect(el.className).not.toContain('pointer-events-none');
  });

  it('applies opacity-0 and pointer-events-none when not visible', () => {
    render(<Fade visible={false}>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('opacity-0');
    expect(el.className).toContain('pointer-events-none');
  });

  it('sets aria-hidden when not visible', () => {
    render(<Fade visible={false}>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('does not set aria-hidden when visible', () => {
    render(<Fade visible>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.getAttribute('aria-hidden')).toBe('false');
  });

  it('applies custom duration via inline style', () => {
    render(
      <Fade visible duration={500}>
        Content
      </Fade>
    );
    const el = screen.getByText('Content');
    expect(el.style.transitionDuration).toBe('500ms');
  });

  it('uses default duration of 200ms', () => {
    render(<Fade visible>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.style.transitionDuration).toBe('200ms');
  });

  it('merges custom className', () => {
    render(
      <Fade visible className="my-custom-class">
        Content
      </Fade>
    );
    const el = screen.getByText('Content');
    expect(el.className).toContain('my-custom-class');
    expect(el.className).toContain('opacity-100');
  });

  it('renders a div wrapper element', () => {
    render(<Fade visible>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.tagName).toBe('DIV');
  });

  it('renders complex children', () => {
    render(
      <Fade visible>
        <span data-testid="child-1">First</span>
        <span data-testid="child-2">Second</span>
      </Fade>
    );
    expect(screen.getByTestId('child-1')).toBeDefined();
    expect(screen.getByTestId('child-2')).toBeDefined();
  });
});

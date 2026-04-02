import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { Fade } from '../Fade.web';

describe('Fade (web)', () => {
  // ── Visibility toggle ───────────────────────────────────────────────────

  it('renders children content', () => {
    render(<Fade>Hello</Fade>);
    expect(screen.getByText('Hello')).toBeDefined();
  });

  it('applies opacity-100 when visible (default)', () => {
    render(<Fade>Content</Fade>);
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
    render(<Fade>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.getAttribute('aria-hidden')).toBe('false');
  });

  it('applies custom duration via inline style', () => {
    render(<Fade duration={500}>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.style.transitionDuration).toBe('500ms');
  });

  it('uses default duration of 200ms', () => {
    render(<Fade>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.style.transitionDuration).toBe('200ms');
  });

  // ── Entrance animation (formerly AnimatedFadeIn) ──────────────────────

  it('applies animate-element class by default (fadeSlideIn)', () => {
    render(<Fade>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('animate-element');
  });

  it('applies animate-slide-right class for slideRightIn type', () => {
    render(<Fade type="slideRightIn">Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('animate-slide-right');
  });

  it('applies animate-testimonial class for testimonialIn type', () => {
    render(<Fade type="testimonialIn">Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('animate-testimonial');
  });

  it('does not apply delay class when delay is 0', () => {
    render(<Fade delay={0}>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.className).not.toMatch(/animate-delay-/);
  });

  it('applies delay class when delay > 0', () => {
    render(<Fade delay={200}>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('animate-delay-200');
  });

  // ── General ───────────────────────────────────────────────────────────

  it('merges custom className', () => {
    render(<Fade className="my-custom-class">Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('my-custom-class');
    expect(el.className).toContain('animate-element');
    expect(el.className).toContain('opacity-100');
  });

  it('combines type, delay, and className correctly', () => {
    render(
      <Fade type="slideRightIn" delay={300} className="my-class">
        Content
      </Fade>
    );
    const el = screen.getByText('Content');
    expect(el.className).toContain('animate-slide-right');
    expect(el.className).toContain('animate-delay-300');
    expect(el.className).toContain('my-class');
  });

  it('renders a div wrapper element', () => {
    render(<Fade>Content</Fade>);
    const el = screen.getByText('Content');
    expect(el.tagName).toBe('DIV');
  });

  it('renders complex children', () => {
    render(
      <Fade>
        <span data-testid="child-1">First</span>
        <span data-testid="child-2">Second</span>
      </Fade>
    );
    expect(screen.getByTestId('child-1')).toBeDefined();
    expect(screen.getByTestId('child-2')).toBeDefined();
  });
});

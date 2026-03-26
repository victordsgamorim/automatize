import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { AnimatedFadeIn } from '../AnimatedFadeIn.web';

describe('AnimatedFadeIn (web)', () => {
  it('renders children content', () => {
    render(<AnimatedFadeIn>Hello</AnimatedFadeIn>);
    expect(screen.getByText('Hello')).toBeDefined();
  });

  it('applies animate-element class by default (fadeSlideIn)', () => {
    render(<AnimatedFadeIn>Content</AnimatedFadeIn>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('animate-element');
  });

  it('applies animate-slide-right class for slideRightIn type', () => {
    render(<AnimatedFadeIn type="slideRightIn">Content</AnimatedFadeIn>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('animate-slide-right');
  });

  it('applies animate-testimonial class for testimonialIn type', () => {
    render(<AnimatedFadeIn type="testimonialIn">Content</AnimatedFadeIn>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('animate-testimonial');
  });

  it('does not apply delay class when delay is 0', () => {
    render(<AnimatedFadeIn delay={0}>Content</AnimatedFadeIn>);
    const el = screen.getByText('Content');
    expect(el.className).not.toMatch(/animate-delay-/);
  });

  it('applies delay class when delay > 0', () => {
    render(<AnimatedFadeIn delay={200}>Content</AnimatedFadeIn>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('animate-delay-200');
  });

  it('merges custom className with animation classes', () => {
    render(
      <AnimatedFadeIn className="flex items-center gap-2">
        Content
      </AnimatedFadeIn>
    );
    const el = screen.getByText('Content');
    expect(el.className).toContain('animate-element');
    expect(el.className).toContain('flex');
    expect(el.className).toContain('items-center');
    expect(el.className).toContain('gap-2');
  });

  it('combines type, delay, and className correctly', () => {
    render(
      <AnimatedFadeIn type="slideRightIn" delay={300} className="my-class">
        Content
      </AnimatedFadeIn>
    );
    const el = screen.getByText('Content');
    expect(el.className).toContain('animate-slide-right');
    expect(el.className).toContain('animate-delay-300');
    expect(el.className).toContain('my-class');
  });

  it('renders a div wrapper element', () => {
    render(<AnimatedFadeIn>Content</AnimatedFadeIn>);
    const el = screen.getByText('Content');
    expect(el.tagName).toBe('DIV');
  });

  it('renders complex children', () => {
    render(
      <AnimatedFadeIn>
        <span data-testid="child-1">First</span>
        <span data-testid="child-2">Second</span>
      </AnimatedFadeIn>
    );
    expect(screen.getByTestId('child-1')).toBeDefined();
    expect(screen.getByTestId('child-2')).toBeDefined();
  });
});

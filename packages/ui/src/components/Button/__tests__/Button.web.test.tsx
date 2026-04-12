import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Button, type ButtonVariant, type ButtonSize } from '../Button.web';

describe('Button (web)', () => {
  it('renders a button element', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined();
  });

  it('has data-slot="button"', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button').getAttribute('data-slot')).toBe('button');
  });

  it.each<ButtonVariant>([
    'default',
    'destructive',
    'outline',
    'secondary',
    'ghost',
    'link',
  ])('renders variant "%s" without error', (variant) => {
    render(<Button variant={variant}>Click</Button>);
    expect(screen.getByRole('button')).toBeDefined();
  });

  it.each<ButtonSize>(['default', 'sm', 'lg', 'icon'])(
    'renders size "%s" without error',
    (size) => {
      render(<Button size={size}>Click</Button>);
      expect(screen.getByRole('button')).toBeDefined();
    }
  );

  it('applies disabled attribute when disabled', () => {
    render(<Button disabled>Click</Button>);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(
      true
    );
  });

  it('applies greyed-out styling classes when disabled', () => {
    render(<Button disabled>Click</Button>);
    const className = screen.getByRole('button').className;
    expect(className).toContain('disabled:!opacity-40');
    expect(className).toContain('disabled:!saturate-0');
    expect(className).toContain('disabled:cursor-default');
  });

  it('does not use cursor-not-allowed when disabled', () => {
    render(<Button disabled>Click</Button>);
    const className = screen.getByRole('button').className;
    expect(className).not.toContain('cursor-not-allowed');
  });

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Click
      </Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="my-custom-class">Click</Button>);
    expect(screen.getByRole('button').className).toContain('my-custom-class');
  });

  it('renders as child element when asChild=true', () => {
    render(
      <Button asChild>
        <a href="/test">Link button</a>
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Link button' });
    expect(link).toBeDefined();
    expect(link.getAttribute('data-slot')).toBe('button');
  });

  it('renders children content', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button').textContent).toBe('Submit');
  });

  // ── Shortcut ──────────────────────────────────────────────────────────────

  it('does not render a Kbd badge when shortcut is not provided', () => {
    render(<Button>Save</Button>);
    expect(document.querySelector('[data-slot="kbd"]')).toBeNull();
  });

  it('renders a Kbd badge with the shortcut text', () => {
    render(<Button shortcut="Esc">Cancel</Button>);
    const kbd = document.querySelector('[data-slot="kbd"]');
    expect(kbd).toBeTruthy();
    expect(kbd?.textContent).toBe('Esc');
  });

  it('renders a Kbd badge with React node shortcut', () => {
    render(<Button shortcut="Enter">Save</Button>);
    const kbd = document.querySelector('[data-slot="kbd"]');
    expect(kbd).toBeTruthy();
    expect(kbd?.textContent).toBe('Enter');
  });

  it('renders both button text and shortcut badge', () => {
    render(<Button shortcut="Enter">Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn.textContent).toContain('Save');
    expect(btn.textContent).toContain('Enter');
  });

  it('does not render Kbd when shortcut is undefined', () => {
    render(<Button shortcut={undefined}>Click</Button>);
    expect(document.querySelector('[data-slot="kbd"]')).toBeNull();
  });
});

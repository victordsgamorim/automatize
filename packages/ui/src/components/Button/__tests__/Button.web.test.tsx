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
});

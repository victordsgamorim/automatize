import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { PrimaryButton } from '../PrimaryButton.web';

describe('PrimaryButton (web)', () => {
  it('renders a button element', () => {
    render(<PrimaryButton>Click me</PrimaryButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined();
  });

  it('applies primary (default) variant class', () => {
    render(<PrimaryButton>Click</PrimaryButton>);
    expect(screen.getByRole('button').className).toContain('bg-primary');
  });

  it('applies disabled attribute when disabled', () => {
    render(<PrimaryButton disabled>Click</PrimaryButton>);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(
      true
    );
  });

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn();
    render(<PrimaryButton onClick={onClick}>Click</PrimaryButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards className', () => {
    render(<PrimaryButton className="extra-class">Click</PrimaryButton>);
    expect(screen.getByRole('button').className).toContain('extra-class');
  });

  it('forwards size prop', () => {
    render(<PrimaryButton size="lg">Click</PrimaryButton>);
    expect(screen.getByRole('button').className).toContain('px-8');
  });

  it('renders shortcut badge when shortcut provided', () => {
    render(<PrimaryButton shortcut="Enter">Save</PrimaryButton>);
    expect(document.querySelector('[data-slot="kbd"]')).toBeTruthy();
  });
});

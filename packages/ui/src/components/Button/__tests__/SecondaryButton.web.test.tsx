import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { SecondaryButton } from '../SecondaryButton.web';

describe('SecondaryButton (web)', () => {
  it('renders a button element', () => {
    render(<SecondaryButton>Click me</SecondaryButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined();
  });

  it('applies secondary variant class', () => {
    render(<SecondaryButton>Click</SecondaryButton>);
    expect(screen.getByRole('button').className).toContain('bg-secondary');
  });

  it('applies disabled attribute when disabled', () => {
    render(<SecondaryButton disabled>Click</SecondaryButton>);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(
      true
    );
  });

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn();
    render(<SecondaryButton onClick={onClick}>Click</SecondaryButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards className', () => {
    render(<SecondaryButton className="extra-class">Click</SecondaryButton>);
    expect(screen.getByRole('button').className).toContain('extra-class');
  });

  it('forwards size prop', () => {
    render(<SecondaryButton size="sm">Click</SecondaryButton>);
    expect(screen.getByRole('button').className).toContain('h-8');
  });

  it('renders shortcut badge when shortcut provided', () => {
    render(<SecondaryButton shortcut="Esc">Cancel</SecondaryButton>);
    expect(document.querySelector('[data-slot="kbd"]')).toBeTruthy();
  });
});

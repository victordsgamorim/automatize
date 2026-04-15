import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { DestructiveButton } from '../DestructiveButton.web';

describe('DestructiveButton (web)', () => {
  it('renders a button element', () => {
    render(<DestructiveButton>Delete</DestructiveButton>);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDefined();
  });

  it('applies destructive variant class', () => {
    render(<DestructiveButton>Delete</DestructiveButton>);
    expect(screen.getByRole('button').className).toContain('bg-destructive');
  });

  it('applies disabled attribute when disabled', () => {
    render(<DestructiveButton disabled>Delete</DestructiveButton>);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(
      true
    );
  });

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn();
    render(<DestructiveButton onClick={onClick}>Delete</DestructiveButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards className', () => {
    render(
      <DestructiveButton className="extra-class">Delete</DestructiveButton>
    );
    expect(screen.getByRole('button').className).toContain('extra-class');
  });

  it('forwards size prop', () => {
    render(<DestructiveButton size="icon">X</DestructiveButton>);
    expect(screen.getByRole('button').className).toContain('size-9');
  });

  it('renders shortcut badge when shortcut provided', () => {
    render(<DestructiveButton shortcut="Del">Delete</DestructiveButton>);
    expect(document.querySelector('[data-slot="kbd"]')).toBeTruthy();
  });
});

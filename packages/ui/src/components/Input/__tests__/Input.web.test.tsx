import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Input } from '../Input.web';

describe('Input (web)', () => {
  it('renders an input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('has data-slot="input"', () => {
    render(<Input />);
    expect(screen.getByRole('textbox').getAttribute('data-slot')).toBe('input');
  });

  it('applies the type prop', () => {
    render(<Input type="email" />);
    expect((document.querySelector('input') as HTMLInputElement).type).toBe(
      'email'
    );
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeDefined();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'hello' },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('applies disabled attribute when disabled', () => {
    render(<Input disabled />);
    expect((screen.getByRole('textbox') as HTMLInputElement).disabled).toBe(
      true
    );
  });

  it('applies custom className', () => {
    render(<Input className="my-custom-class" />);
    expect(screen.getByRole('textbox').className).toContain('my-custom-class');
  });

  it('forwards value prop', () => {
    render(<Input value="prefilled" onChange={vi.fn()} />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(
      'prefilled'
    );
  });
});

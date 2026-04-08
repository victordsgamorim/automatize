import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Input } from '../Input.web';

describe('Input (web)', () => {
  // ── Base input behavior ───────────────────────────────────────────────────

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
    expect(screen.getByRole('textbox').disabled).toBe(true);
  });

  it('applies custom className', () => {
    render(<Input className="my-custom-class" />);
    expect(screen.getByRole('textbox').className).toContain('my-custom-class');
  });

  it('forwards value prop', () => {
    render(<Input value="prefilled" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox').value).toBe('prefilled');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeDefined();
    expect(ref.current?.tagName).toBe('INPUT');
  });

  // ── Label integration (formerly FormField) ────────────────────────────────

  it('renders label when label prop is provided', () => {
    render(<Input label="Email" id="email-input" />);
    expect(screen.getByText('Email')).toBeDefined();
  });

  it('associates label with input via htmlFor when id is provided', () => {
    render(<Input label="Email" id="email-input" />);
    const label = screen.getByText('Email').closest('label');
    expect(label?.getAttribute('for')).toBe('email-input');
  });

  it('wraps input with spacing div when label is provided', () => {
    const { container } = render(<Input label="Email" id="email-input" />);
    expect((container.firstChild as HTMLElement).className).toContain(
      'space-y-1.5'
    );
  });

  it('renders just input when no label or error is provided', () => {
    const { container } = render(<Input />);
    expect(container.firstChild?.nodeName).toBe('INPUT');
  });

  // ── Error display ─────────────────────────────────────────────────────────

  it('renders error message when error prop is provided', () => {
    render(<Input error="Required field" />);
    expect(screen.getByText('Required field')).toBeDefined();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Input error="Required" />);
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe(
      'true'
    );
  });

  it('applies wrapperClassName to the outer div', () => {
    const { container } = render(
      <Input label="Email" id="e" wrapperClassName="my-wrapper" />
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      'my-wrapper'
    );
  });
});

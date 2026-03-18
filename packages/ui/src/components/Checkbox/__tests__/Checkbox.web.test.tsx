import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import { Checkbox } from '../Checkbox.web';

describe('Checkbox (web)', () => {
  it('has data-slot="checkbox"', () => {
    render(<Checkbox />);
    expect(document.querySelector('[data-slot="checkbox"]')).toBeTruthy();
  });

  it('is unchecked by default', () => {
    render(<Checkbox />);
    const checkbox = document.querySelector('[data-slot="checkbox"]');
    expect(checkbox?.getAttribute('data-state')).toBe('unchecked');
  });

  it('is checked when checked=true', () => {
    render(<Checkbox checked />);
    const checkbox = document.querySelector('[data-slot="checkbox"]');
    expect(checkbox?.getAttribute('data-state')).toBe('checked');
  });

  it('calls onCheckedChange with true when clicked from unchecked state', () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange} />);
    const checkbox = document.querySelector(
      '[data-slot="checkbox"]'
    ) as HTMLElement;
    fireEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('applies disabled attribute when disabled', () => {
    render(<Checkbox disabled />);
    const checkbox = document.querySelector(
      '[data-slot="checkbox"]'
    ) as HTMLButtonElement | null;
    expect(checkbox?.disabled).toBe(true);
  });

  it('applies custom className', () => {
    render(<Checkbox className="my-custom-class" />);
    const checkbox = document.querySelector('[data-slot="checkbox"]');
    expect(checkbox?.className).toContain('my-custom-class');
  });
});

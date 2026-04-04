import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import { RadioGroup, RadioGroupItem } from '../RadioGroup.web';

describe('RadioGroup (web)', () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders with data-slot="radio-group"', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" />
      </RadioGroup>
    );
    expect(document.querySelector('[data-slot="radio-group"]')).toBeTruthy();
  });

  it('renders items with data-slot="radio-group-item"', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    );
    expect(
      document.querySelectorAll('[data-slot="radio-group-item"]').length
    ).toBe(2);
  });

  // ── Orientation ───────────────────────────────────────────────────────────

  it('defaults to vertical orientation with flex-col classes', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" />
      </RadioGroup>
    );
    const el = document.querySelector(
      '[data-slot="radio-group"]'
    ) as HTMLElement;
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
    expect(el.className).toContain('flex-col');
  });

  it('applies horizontal orientation classes when specified', () => {
    render(
      <RadioGroup orientation="horizontal">
        <RadioGroupItem value="a" />
      </RadioGroup>
    );
    const el = document.querySelector(
      '[data-slot="radio-group"]'
    ) as HTMLElement;
    expect(el.getAttribute('aria-orientation')).toBe('horizontal');
    expect(el.className).toContain('flex-row');
  });

  // ── className ─────────────────────────────────────────────────────────────

  it('merges custom className on root', () => {
    render(
      <RadioGroup className="my-group">
        <RadioGroupItem value="a" />
      </RadioGroup>
    );
    const el = document.querySelector(
      '[data-slot="radio-group"]'
    ) as HTMLElement;
    expect(el.className).toContain('my-group');
  });

  it('merges custom className on item', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" className="my-item" />
      </RadioGroup>
    );
    const el = document.querySelector(
      '[data-slot="radio-group-item"]'
    ) as HTMLElement;
    expect(el.className).toContain('my-item');
  });

  // ── Selection behavior ───────────────────────────────────────────────────

  it('marks item checked when it matches defaultValue', () => {
    render(
      <RadioGroup defaultValue="b">
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    );
    const items = document.querySelectorAll(
      '[data-slot="radio-group-item"]'
    ) as NodeListOf<HTMLElement>;
    expect(items[0].getAttribute('data-state')).toBe('unchecked');
    expect(items[1].getAttribute('data-state')).toBe('checked');
  });

  it('shows the indicator for the checked item', () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    );
    // The Radix indicator only renders its children when the item is checked
    const indicators = document.querySelectorAll(
      '[data-slot="radio-group-indicator"]'
    );
    expect(indicators.length).toBe(1);
  });

  it('calls onValueChange when a different item is selected', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="a" onValueChange={onValueChange}>
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    );
    const items = document.querySelectorAll(
      '[data-slot="radio-group-item"]'
    ) as NodeListOf<HTMLElement>;
    fireEvent.click(items[1]);
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('respects controlled value prop', () => {
    const { rerender } = render(
      <RadioGroup value="a" onValueChange={() => {}}>
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    );
    let items = document.querySelectorAll(
      '[data-slot="radio-group-item"]'
    ) as NodeListOf<HTMLElement>;
    expect(items[0].getAttribute('data-state')).toBe('checked');

    rerender(
      <RadioGroup value="b" onValueChange={() => {}}>
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    );
    items = document.querySelectorAll(
      '[data-slot="radio-group-item"]'
    ) as NodeListOf<HTMLElement>;
    expect(items[1].getAttribute('data-state')).toBe('checked');
  });

  // ── Disabled state ───────────────────────────────────────────────────────

  it('does not fire onValueChange for disabled items', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="a" onValueChange={onValueChange}>
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" disabled />
      </RadioGroup>
    );
    const items = document.querySelectorAll(
      '[data-slot="radio-group-item"]'
    ) as NodeListOf<HTMLElement>;
    fireEvent.click(items[1]);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

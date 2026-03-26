import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../Select.web';

describe('Select (web)', () => {
  it('renders trigger with data-slot="select-trigger"', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(document.querySelector('[data-slot="select-trigger"]')).toBeTruthy();
  });

  it('renders placeholder text', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Choose an option')).toBeTruthy();
  });

  it('displays selected value', () => {
    render(
      <Select defaultValue="b">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Beta</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Beta')).toBeTruthy();
  });

  it('calls onValueChange when item is selected', () => {
    const onChange = vi.fn();
    render(
      <Select onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Beta</SelectItem>
        </SelectContent>
      </Select>
    );
    // Open the select
    fireEvent.click(
      document.querySelector('[data-slot="select-trigger"]') as HTMLElement
    );
    // Click an item
    const item = screen.getByText('Alpha');
    fireEvent.click(item);
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('applies custom className to trigger', () => {
    render(
      <Select>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    );
    const trigger = document.querySelector('[data-slot="select-trigger"]');
    expect(trigger?.className).toContain('w-[200px]');
  });
});

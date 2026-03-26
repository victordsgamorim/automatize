import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Popover, PopoverTrigger, PopoverContent } from '../Popover.web';

describe('Popover (web)', () => {
  it('renders trigger with data-slot="popover-trigger"', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    expect(
      document.querySelector('[data-slot="popover-trigger"]')
    ).toBeTruthy();
  });

  it('does not render content initially', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    expect(document.querySelector('[data-slot="popover-content"]')).toBeNull();
  });

  it('renders content when trigger is clicked', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    fireEvent.click(screen.getByText('Open'));
    expect(
      document.querySelector('[data-slot="popover-content"]')
    ).toBeTruthy();
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('renders content with controlled open state', () => {
    render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    expect(
      document.querySelector('[data-slot="popover-content"]')
    ).toBeTruthy();
  });

  it('applies custom className to content', () => {
    render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="my-custom">Content</PopoverContent>
      </Popover>
    );
    const content = document.querySelector('[data-slot="popover-content"]');
    expect(content?.className).toContain('my-custom');
  });
});

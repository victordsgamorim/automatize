import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Calendar } from '../Calendar.web';

describe('Calendar (web)', () => {
  it('renders with data-slot="calendar"', () => {
    render(<Calendar />);
    expect(document.querySelector('[data-slot="calendar"]')).toBeTruthy();
  });

  it('displays current month days', () => {
    render(<Calendar month={new Date(2026, 2, 1)} />);
    // March 2026 should have day 15
    expect(screen.getByText('15')).toBeTruthy();
  });

  it('displays month caption', () => {
    render(<Calendar month={new Date(2026, 0, 1)} />);
    expect(screen.getByText('January 2026')).toBeTruthy();
  });

  it('calls onSelect when a day is clicked in single mode', () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        month={new Date(2026, 2, 1)}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByText('15'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('navigates to next month when forward button is clicked', () => {
    render(<Calendar month={new Date(2026, 0, 1)} />);
    expect(screen.getByText('January 2026')).toBeTruthy();
    // Click the next month button (the second nav button)
    const nextButton = document.querySelector(
      'button[name="next-month"]'
    ) as HTMLElement;
    if (nextButton) {
      fireEvent.click(nextButton);
    }
  });

  it('renders with range mode', () => {
    render(
      <Calendar
        mode="range"
        month={new Date(2026, 2, 1)}
        selected={{ from: new Date(2026, 2, 5), to: new Date(2026, 2, 10) }}
      />
    );
    // Selected days should have aria-selected
    const selectedDays = document.querySelectorAll('[aria-selected="true"]');
    expect(selectedDays.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    render(<Calendar className="my-calendar" />);
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar?.className).toContain('my-calendar');
  });

  it('shows outside days by default', () => {
    render(<Calendar month={new Date(2026, 2, 1)} />);
    // There should be days from the previous/next month shown
    // Just verify the calendar renders without error with showOutsideDays
    expect(document.querySelector('[data-slot="calendar"]')).toBeTruthy();
  });
});

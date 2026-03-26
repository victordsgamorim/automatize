import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { DateRangePicker } from '../DateRangePicker.web';

describe('DateRangePicker (web)', () => {
  // ── Trigger rendering ─────────────────────────────────────────────────────

  it('renders trigger with data-slot="date-range-picker-trigger"', () => {
    render(<DateRangePicker />);
    expect(
      document.querySelector('[data-slot="date-range-picker-trigger"]')
    ).toBeTruthy();
  });

  it('renders default placeholder text', () => {
    render(<DateRangePicker />);
    expect(screen.getByText('Pick a date range')).toBeTruthy();
  });

  it('renders custom placeholder text', () => {
    render(<DateRangePicker placeholder="Select dates" />);
    expect(screen.getByText('Select dates')).toBeTruthy();
  });

  it('displays formatted date when selected', () => {
    render(<DateRangePicker selected={{ from: new Date(2026, 2, 15) }} />);
    expect(screen.getByText('Mar 15, 2026')).toBeTruthy();
  });

  it('displays formatted date range when both dates selected', () => {
    render(
      <DateRangePicker
        selected={{ from: new Date(2026, 2, 15), to: new Date(2026, 2, 20) }}
      />
    );
    expect(screen.getByText('Mar 15, 2026 – Mar 20, 2026')).toBeTruthy();
  });

  // ── Popover open/close ──────────────────────────────────────────────────

  it('does not render popover content initially', () => {
    render(<DateRangePicker />);
    expect(
      document.querySelector('[data-slot="date-range-picker-content"]')
    ).toBeNull();
  });

  it('opens popover when trigger is clicked', () => {
    render(<DateRangePicker />);
    fireEvent.click(
      document.querySelector(
        '[data-slot="date-range-picker-trigger"]'
      ) as HTMLElement
    );
    expect(
      document.querySelector('[data-slot="date-range-picker-content"]')
    ).toBeTruthy();
  });

  // ── Buttons ─────────────────────────────────────────────────────────────

  it('renders Apply and Clear buttons in popover', () => {
    render(<DateRangePicker />);
    fireEvent.click(
      document.querySelector(
        '[data-slot="date-range-picker-trigger"]'
      ) as HTMLElement
    );
    expect(screen.getByText('Apply')).toBeTruthy();
    expect(screen.getByText('Clear')).toBeTruthy();
  });

  it('renders custom button labels', () => {
    render(<DateRangePicker clearLabel="Limpar" applyLabel="Aplicar" />);
    fireEvent.click(
      document.querySelector(
        '[data-slot="date-range-picker-trigger"]'
      ) as HTMLElement
    );
    expect(screen.getByText('Aplicar')).toBeTruthy();
    expect(screen.getByText('Limpar')).toBeTruthy();
  });

  it('disables Apply when no date is selected', () => {
    render(<DateRangePicker />);
    fireEvent.click(
      document.querySelector(
        '[data-slot="date-range-picker-trigger"]'
      ) as HTMLElement
    );
    const applyButton = screen.getByText('Apply').closest('button');
    expect(applyButton?.disabled).toBe(true);
  });

  it('disables Clear when no date is selected', () => {
    render(<DateRangePicker />);
    fireEvent.click(
      document.querySelector(
        '[data-slot="date-range-picker-trigger"]'
      ) as HTMLElement
    );
    const clearButton = screen.getByText('Clear').closest('button');
    expect(clearButton?.disabled).toBe(true);
  });

  // ── Callbacks ───────────────────────────────────────────────────────────

  it('calls onApply when Apply button is clicked with selection', async () => {
    const onApply = vi.fn();
    const selected = {
      from: new Date(2026, 2, 15),
      to: new Date(2026, 2, 20),
    };
    render(<DateRangePicker selected={selected} onApply={onApply} />);
    fireEvent.click(
      document.querySelector(
        '[data-slot="date-range-picker-trigger"]'
      ) as HTMLElement
    );

    await waitFor(() => {
      const applyButton = screen.getByText('Apply').closest('button');
      expect(applyButton?.disabled).toBe(false);
    });

    fireEvent.click(screen.getByText('Apply'));
    expect(onApply).toHaveBeenCalled();
  });

  // ── Month/Year dropdowns ────────────────────────────────────────────────

  it('renders month and year dropdowns in popover', () => {
    render(<DateRangePicker />);
    fireEvent.click(
      document.querySelector(
        '[data-slot="date-range-picker-trigger"]'
      ) as HTMLElement
    );
    // Two select triggers should be present (month + year)
    const selectTriggers = document.querySelectorAll(
      '[data-slot="select-trigger"]'
    );
    expect(selectTriggers.length).toBe(2);
  });

  // ── Calendar ────────────────────────────────────────────────────────────

  it('renders calendar inside popover', () => {
    render(<DateRangePicker />);
    fireEvent.click(
      document.querySelector(
        '[data-slot="date-range-picker-trigger"]'
      ) as HTMLElement
    );
    expect(document.querySelector('[data-slot="calendar"]')).toBeTruthy();
  });

  // ── Custom className ────────────────────────────────────────────────────

  it('applies custom className to trigger', () => {
    render(<DateRangePicker className="w-[300px]" />);
    const trigger = document.querySelector(
      '[data-slot="date-range-picker-trigger"]'
    );
    expect(trigger?.className).toContain('w-[300px]');
  });
});

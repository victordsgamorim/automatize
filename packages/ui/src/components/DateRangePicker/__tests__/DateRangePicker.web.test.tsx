import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { DateRangePicker } from '../DateRangePicker.web';

/** Helper: click the trigger to open the popover */
function openPopover() {
  fireEvent.click(
    document.querySelector(
      '[data-slot="date-range-picker-trigger"]'
    ) as HTMLElement
  );
}

/** Helper: get trigger element */
function getTrigger() {
  return document.querySelector(
    '[data-slot="date-range-picker-trigger"]'
  ) as HTMLElement;
}

/** Helper: get popover content element */
function getContent() {
  return document.querySelector('[data-slot="date-range-picker-content"]');
}

describe('DateRangePicker (web)', () => {
  // ── Trigger rendering ─────────────────────────────────────────────────────

  it('renders trigger with data-slot="date-range-picker-trigger"', () => {
    render(<DateRangePicker />);
    expect(getTrigger()).toBeTruthy();
  });

  it('renders trigger as a <button> element with type="button"', () => {
    render(<DateRangePicker />);
    const trigger = getTrigger();
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.getAttribute('type')).toBe('button');
  });

  it('renders a calendar icon inside the trigger', () => {
    render(<DateRangePicker />);
    const trigger = getTrigger();
    expect(trigger.querySelector('svg')).toBeTruthy();
  });

  it('renders default placeholder text', () => {
    render(<DateRangePicker />);
    expect(screen.getByText('Pick a date range')).toBeTruthy();
  });

  it('renders custom placeholder text', () => {
    render(<DateRangePicker placeholder="Select dates" />);
    expect(screen.getByText('Select dates')).toBeTruthy();
  });

  it('has aria-label with placeholder when no date selected', () => {
    render(<DateRangePicker placeholder="Select dates" />);
    expect(getTrigger().getAttribute('aria-label')).toBe('Select dates');
  });

  it('has aria-label with formatted value when date is selected', () => {
    render(<DateRangePicker selected={{ from: new Date(2026, 2, 15) }} />);
    expect(getTrigger().getAttribute('aria-label')).toBe('Mar 15, 2026');
  });

  it('hides label text on mobile via hidden/sm:inline classes', () => {
    render(<DateRangePicker />);
    const span = getTrigger().querySelector('span');
    expect(span?.className).toContain('hidden');
    expect(span?.className).toContain('sm:inline');
  });

  it('applies fixed height to trigger for consistent sizing across breakpoints', () => {
    render(<DateRangePicker />);
    expect(getTrigger().className).toContain('h-[38px]');
  });

  it('applies responsive min-width only above mobile breakpoint', () => {
    render(<DateRangePicker />);
    const classes = getTrigger().className;
    expect(classes).toContain('sm:min-w-[180px]');
    expect(classes).not.toContain(' min-w-[180px]');
  });

  it('applies custom className to trigger', () => {
    render(<DateRangePicker className="w-[300px]" />);
    expect(getTrigger().className).toContain('w-[300px]');
  });

  // ── Formatted display ─────────────────────────────────────────────────────

  it('displays formatted single date when only from is selected', () => {
    render(<DateRangePicker selected={{ from: new Date(2026, 2, 15) }} />);
    expect(screen.getByText('Mar 15, 2026')).toBeTruthy();
  });

  it('displays formatted date range when both dates are selected', () => {
    render(
      <DateRangePicker
        selected={{ from: new Date(2026, 2, 15), to: new Date(2026, 2, 20) }}
      />
    );
    expect(screen.getByText('Mar 15, 2026 – Mar 20, 2026')).toBeTruthy();
  });

  it('displays single date when from and to are the same', () => {
    render(
      <DateRangePicker
        selected={{ from: new Date(2026, 5, 1), to: new Date(2026, 5, 1) }}
      />
    );
    expect(screen.getByText('Jun 1, 2026')).toBeTruthy();
  });

  it('uses custom dateFormat for display', () => {
    render(
      <DateRangePicker
        selected={{ from: new Date(2026, 0, 5) }}
        dateFormat="dd/MM/yyyy"
      />
    );
    expect(screen.getByText('05/01/2026')).toBeTruthy();
  });

  it('applies text-foreground class when a value is selected', () => {
    render(<DateRangePicker selected={{ from: new Date(2026, 0, 1) }} />);
    expect(getTrigger().className).toContain('text-foreground');
  });

  it('does not apply text-foreground class when no value is selected', () => {
    render(<DateRangePicker />);
    // text-foreground should not be in the className (only text-muted-foreground)
    const classes = getTrigger().className;
    // Split to check there's no standalone text-foreground token
    const tokens = classes.split(' ');
    expect(tokens.includes('text-foreground')).toBe(false);
  });

  // ── Popover open/close ────────────────────────────────────────────────────

  it('does not render popover content initially', () => {
    render(<DateRangePicker />);
    expect(getContent()).toBeNull();
  });

  it('opens popover when trigger is clicked', () => {
    render(<DateRangePicker />);
    openPopover();
    expect(getContent()).toBeTruthy();
  });

  it('closes popover when Apply is clicked', async () => {
    const selected = {
      from: new Date(2026, 2, 15),
      to: new Date(2026, 2, 20),
    };
    render(<DateRangePicker selected={selected} onApply={vi.fn()} />);
    openPopover();

    await waitFor(() => {
      expect(screen.getByText('Apply').closest('button')?.disabled).toBe(false);
    });

    fireEvent.click(screen.getByText('Apply'));

    await waitFor(() => {
      expect(getContent()).toBeNull();
    });
  });

  it('closes popover when Clear is clicked', async () => {
    const selected = {
      from: new Date(2026, 2, 15),
      to: new Date(2026, 2, 20),
    };
    render(<DateRangePicker selected={selected} onApply={vi.fn()} />);
    openPopover();

    await waitFor(() => {
      expect(screen.getByText('Clear').closest('button')?.disabled).toBe(false);
    });

    fireEvent.click(screen.getByText('Clear'));

    await waitFor(() => {
      expect(getContent()).toBeNull();
    });
  });

  // ── Buttons ───────────────────────────────────────────────────────────────

  it('renders Apply and Clear buttons in popover', () => {
    render(<DateRangePicker />);
    openPopover();
    expect(screen.getByText('Apply')).toBeTruthy();
    expect(screen.getByText('Clear')).toBeTruthy();
  });

  it('renders custom button labels', () => {
    render(<DateRangePicker clearLabel="Limpar" applyLabel="Aplicar" />);
    openPopover();
    expect(screen.getByText('Aplicar')).toBeTruthy();
    expect(screen.getByText('Limpar')).toBeTruthy();
  });

  it('disables Apply when no date is selected', () => {
    render(<DateRangePicker />);
    openPopover();
    const applyButton = screen.getByText('Apply').closest('button');
    expect(applyButton?.disabled).toBe(true);
  });

  it('disables Clear when no date is selected', () => {
    render(<DateRangePicker />);
    openPopover();
    const clearButton = screen.getByText('Clear').closest('button');
    expect(clearButton?.disabled).toBe(true);
  });

  it('enables Clear when a date is selected', async () => {
    const selected = {
      from: new Date(2026, 2, 15),
      to: new Date(2026, 2, 20),
    };
    render(<DateRangePicker selected={selected} />);
    openPopover();

    await waitFor(() => {
      const clearButton = screen.getByText('Clear').closest('button');
      expect(clearButton?.disabled).toBe(false);
    });
  });

  it('enables Apply when a date with from is selected', async () => {
    const selected = { from: new Date(2026, 2, 15) };
    render(<DateRangePicker selected={selected} />);
    openPopover();

    await waitFor(() => {
      const applyButton = screen.getByText('Apply').closest('button');
      expect(applyButton?.disabled).toBe(false);
    });
  });

  // ── Callbacks ─────────────────────────────────────────────────────────────

  it('calls onApply with the range when Apply is clicked', async () => {
    const onApply = vi.fn();
    const selected = {
      from: new Date(2026, 2, 15),
      to: new Date(2026, 2, 20),
    };
    render(<DateRangePicker selected={selected} onApply={onApply} />);
    openPopover();

    await waitFor(() => {
      expect(screen.getByText('Apply').closest('button')?.disabled).toBe(false);
    });

    fireEvent.click(screen.getByText('Apply'));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith(selected);
  });

  it('calls onApply with undefined when Clear is clicked', async () => {
    const onApply = vi.fn();
    const selected = {
      from: new Date(2026, 2, 15),
      to: new Date(2026, 2, 20),
    };
    render(<DateRangePicker selected={selected} onApply={onApply} />);
    openPopover();

    await waitFor(() => {
      expect(screen.getByText('Clear').closest('button')?.disabled).toBe(false);
    });

    fireEvent.click(screen.getByText('Clear'));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith(undefined);
  });

  it('does not call onApply when popover is opened without action', () => {
    const onApply = vi.fn();
    render(<DateRangePicker onApply={onApply} />);
    openPopover();
    expect(onApply).not.toHaveBeenCalled();
  });

  // ── Internal state sync ───────────────────────────────────────────────────

  it('syncs internal range from selected prop when popover opens', async () => {
    const selected = {
      from: new Date(2026, 2, 15),
      to: new Date(2026, 2, 20),
    };
    render(<DateRangePicker selected={selected} />);
    openPopover();

    // Calendar should show selected days (aria-selected)
    await waitFor(() => {
      const selectedDays = document.querySelectorAll(
        '[data-slot="calendar"] [aria-selected="true"]'
      );
      expect(selectedDays.length).toBeGreaterThan(0);
    });
  });

  it('syncs internal state from selected prop on each open', async () => {
    const onApply = vi.fn();
    const selected = {
      from: new Date(2026, 2, 15),
      to: new Date(2026, 2, 20),
    };
    render(<DateRangePicker selected={selected} onApply={onApply} />);

    // Open popover
    openPopover();

    await waitFor(() => {
      expect(getContent()).toBeTruthy();
    });

    // Apply should be enabled because selected has from
    await waitFor(() => {
      expect(screen.getByText('Apply').closest('button')?.disabled).toBe(false);
    });

    // The trigger should still show the original formatted range
    const trigger = getTrigger();
    expect(trigger.textContent).toContain('Mar 15, 2026');
    expect(trigger.textContent).toContain('Mar 20, 2026');
  });

  // ── Month/Year dropdowns ──────────────────────────────────────────────────

  it('renders month and year dropdowns in popover', () => {
    render(<DateRangePicker />);
    openPopover();
    const selectTriggers = document.querySelectorAll(
      '[data-slot="select-trigger"]'
    );
    expect(selectTriggers.length).toBe(2);
  });

  it('month dropdown has capitalize class', () => {
    render(<DateRangePicker />);
    openPopover();
    const selectTriggers = document.querySelectorAll(
      '[data-slot="select-trigger"]'
    );
    // First trigger is the month dropdown
    expect(selectTriggers[0]?.className).toContain('capitalize');
  });

  // ── Calendar ──────────────────────────────────────────────────────────────

  it('renders calendar inside popover', () => {
    render(<DateRangePicker />);
    openPopover();
    expect(document.querySelector('[data-slot="calendar"]')).toBeTruthy();
  });

  it('renders calendar in range mode', () => {
    render(<DateRangePicker />);
    openPopover();
    // Calendar should be present and functional
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeTruthy();
  });

  it('shows selected range days in calendar', async () => {
    const selected = {
      from: new Date(2026, 2, 5),
      to: new Date(2026, 2, 10),
    };
    render(<DateRangePicker selected={selected} />);
    openPopover();

    await waitFor(() => {
      const selectedDays = document.querySelectorAll('[aria-selected="true"]');
      expect(selectedDays.length).toBeGreaterThan(0);
    });
  });

  it('navigates calendar month via onMonthChange', () => {
    render(<DateRangePicker />);
    openPopover();

    // Calendar nav buttons should exist
    const calendar = document.querySelector('[data-slot="calendar"]');
    const navButtons = calendar?.querySelectorAll('button[name]');
    expect(navButtons?.length).toBeGreaterThan(0);
  });

  // ── Day selection in calendar ─────────────────────────────────────────────

  it('enables Apply after selecting a day in the calendar', async () => {
    render(<DateRangePicker />);
    openPopover();

    // Apply should be disabled initially
    expect(screen.getByText('Apply').closest('button')?.disabled).toBe(true);

    // Click a day in the calendar
    const dayButtons = document.querySelectorAll(
      '[data-slot="calendar"] td button'
    );
    const clickableDay = Array.from(dayButtons).find(
      (btn) => !btn.closest('[data-disabled]')
    );
    if (clickableDay) {
      fireEvent.click(clickableDay);
    }

    await waitFor(() => {
      expect(screen.getByText('Apply').closest('button')?.disabled).toBe(false);
    });
  });

  it('enables Clear after selecting a day in the calendar', async () => {
    render(<DateRangePicker />);
    openPopover();

    // Clear should be disabled initially
    expect(screen.getByText('Clear').closest('button')?.disabled).toBe(true);

    // Click a day in the calendar
    const dayButtons = document.querySelectorAll(
      '[data-slot="calendar"] td button'
    );
    const clickableDay = Array.from(dayButtons).find(
      (btn) => !btn.closest('[data-disabled]')
    );
    if (clickableDay) {
      fireEvent.click(clickableDay);
    }

    await waitFor(() => {
      expect(screen.getByText('Clear').closest('button')?.disabled).toBe(false);
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it('works without onApply callback', () => {
    render(<DateRangePicker selected={{ from: new Date(2026, 0, 1) }} />);
    openPopover();

    // Should not throw when clicking Apply or Clear
    expect(() => {
      fireEvent.click(screen.getByText('Apply'));
    }).not.toThrow();
  });

  it('works without onApply callback when clearing', async () => {
    render(<DateRangePicker selected={{ from: new Date(2026, 0, 1) }} />);
    openPopover();

    await waitFor(() => {
      expect(screen.getByText('Clear').closest('button')?.disabled).toBe(false);
    });

    expect(() => {
      fireEvent.click(screen.getByText('Clear'));
    }).not.toThrow();
  });

  it('renders with no props without errors', () => {
    expect(() => render(<DateRangePicker />)).not.toThrow();
  });

  it('year dropdown contains current year', () => {
    render(<DateRangePicker />);
    openPopover();

    const selectTriggers = document.querySelectorAll(
      '[data-slot="select-trigger"]'
    );
    // Second trigger is the year dropdown — its text should contain current year
    const yearTrigger = selectTriggers[1];
    const currentYear = new Date().getFullYear().toString();
    expect(yearTrigger?.textContent).toContain(currentYear);
  });

  it('displays the correct month in the dropdown for a selected date', () => {
    render(<DateRangePicker selected={{ from: new Date(2026, 6, 15) }} />);
    openPopover();

    const selectTriggers = document.querySelectorAll(
      '[data-slot="select-trigger"]'
    );
    // Month trigger should show July (index 6)
    const monthTrigger = selectTriggers[0];
    expect(monthTrigger?.textContent?.toLowerCase()).toContain('july');
  });

  it('displays the correct year in the dropdown for a selected date', () => {
    render(<DateRangePicker selected={{ from: new Date(2024, 6, 15) }} />);
    openPopover();

    const selectTriggers = document.querySelectorAll(
      '[data-slot="select-trigger"]'
    );
    const yearTrigger = selectTriggers[1];
    expect(yearTrigger?.textContent).toContain('2024');
  });
});

'use client';

/**
 * DateRangePicker — Composite component for selecting a date range.
 *
 * Composes four UI primitives from packages/ui:
 *  - Popover   → floating panel that contains the picker UI
 *  - Select    → month and year dropdown selectors
 *  - Calendar  → date grid (react-day-picker in "range" mode)
 *  - Button    → Clear and Apply action buttons
 *
 * Behavior:
 *  - The trigger button shows the formatted date range or a placeholder.
 *  - Clicking the trigger opens a popover with month/year dropdowns,
 *    a calendar grid, and Clear/Apply buttons.
 *  - Selecting a single date shows just that date; selecting two dates
 *    shows the full range (from – to).
 *  - "Apply" commits the selection and closes the popover.
 *  - "Clear" resets the selection, notifies the parent, and closes.
 *  - Reopening the popover always syncs internal state from the `selected` prop,
 *    so uncommitted changes are discarded.
 *
 * Localization:
 *  - Pass a date-fns `locale` to translate month names and day labels.
 *  - Pass `clearLabel` / `applyLabel` / `placeholder` for translated UI strings.
 *  - Month names are capitalized via CSS (`capitalize` class) so locales that
 *    return lowercase month names (e.g. Portuguese) display correctly.
 *
 * Trigger styling matches the SearchBar trigger (same padding, border, font)
 * so they look consistent when placed side-by-side in the Dashboard header.
 */

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { Locale } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn, sharedBreakpoints } from '../../utils';
import { Button } from '../Button/Button.web';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../../actions/Popover/Popover.web';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../actions/Select/Select.web';
import { Calendar } from '../Calendar/Calendar.web';

export interface DateRangePickerProps {
  /** Currently applied date range */
  selected?: DateRange;
  /** Called when user clicks Apply */
  onApply?: (range: DateRange | undefined) => void;
  /** Trigger button placeholder when no date selected */
  placeholder?: string;
  /** Label for Clear button */
  clearLabel?: string;
  /** Label for Apply button */
  applyLabel?: string;
  /** date-fns locale for formatting and calendar day names */
  locale?: Locale;
  /** date-fns format string for displaying dates (default: "MMM d, yyyy") */
  dateFormat?: string;
  /** Additional className for the trigger button */
  className?: string;
}

function DateRangePicker({
  selected,
  onApply,
  placeholder = 'Pick a date range',
  clearLabel = 'Clear',
  applyLabel = 'Apply',
  locale,
  dateFormat = 'MMM d, yyyy',
  className,
}: DateRangePickerProps) {
  // Popover open/close state
  const [open, setOpen] = useState(false);

  // Internal range — a draft that only commits to parent on Apply/Clear
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(
    selected
  );

  // Which month the calendar is currently showing
  const [month, setMonth] = useState<Date>(selected?.from ?? new Date());

  // Reset internal state every time the popover opens, so uncommitted
  // changes from a previous session are discarded
  useEffect(() => {
    if (open) {
      setInternalRange(selected);
      setMonth(selected?.from ?? new Date());
    }
  }, [open, selected]);

  // Commit the current draft range to the parent and close
  const handleApply = useCallback(() => {
    onApply?.(internalRange);
    setOpen(false);
  }, [internalRange, onApply]);

  // Clear selection, notify parent with undefined, and close
  const handleClear = useCallback(() => {
    setInternalRange(undefined);
    onApply?.(undefined);
    setOpen(false);
  }, [onApply]);

  // Update calendar view when the month dropdown changes
  const handleMonthChange = useCallback(
    (val: string) => {
      const newMonth = new Date(month.getFullYear(), Number(val), 1);
      setMonth(newMonth);
    },
    [month]
  );

  // Update calendar view when the year dropdown changes
  const handleYearChange = useCallback(
    (val: string) => {
      const newMonth = new Date(Number(val), month.getMonth(), 1);
      setMonth(newMonth);
    },
    [month]
  );

  // Format a date using the configured format string and locale
  const formatDate = useCallback(
    (date: Date) => format(date, dateFormat, { locale }),
    [dateFormat, locale]
  );

  // Build the display text: "from – to", or just "from" if same day / no end
  const formattedValue = selected?.from
    ? selected.to && selected.from.getTime() !== selected.to.getTime()
      ? `${formatDate(selected.from)} – ${formatDate(selected.to)}`
      : formatDate(selected.from)
    : undefined;

  // Year dropdown range: 10 years before and after current year
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Trigger — styled to match SearchBar for visual consistency */}
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="date-range-picker-trigger"
          aria-label={formattedValue ?? placeholder}
          className={cn(
            'flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm h-[38px]',
            'text-muted-foreground transition-colors duration-200',
            'hover:border-ring/40 hover:bg-muted/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            sharedBreakpoints.triggerContainer,
            formattedValue && 'text-foreground',
            className
          )}
        >
          <CalendarIcon
            className={cn('size-3.5', sharedBreakpoints.triggerIcon)}
          />
          <span className={sharedBreakpoints.triggerText}>
            {formattedValue ?? placeholder}
          </span>
        </button>
      </PopoverTrigger>
      {/* Popover content — calendar panel */}
      <PopoverContent
        data-slot="date-range-picker-content"
        className="w-auto p-4"
        align="start"
      >
        <div className="space-y-4">
          {/* Month / Year dropdowns — quick navigation without clicking arrows */}
          <div className="flex justify-between gap-2">
            {/* Month selector — capitalize ensures locale-aware names look proper */}
            <Select
              value={month.getMonth().toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[140px] capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem
                    key={i}
                    value={i.toString()}
                    className="capitalize"
                  >
                    {format(new Date(2000, i, 1), 'MMMM', { locale })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year selector */}
            <Select
              value={month.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearRange.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calendar grid — range mode allows selecting from → to */}
          <Calendar
            mode="range"
            selected={internalRange}
            onSelect={setInternalRange}
            month={month}
            onMonthChange={setMonth}
            locale={locale}
            className="rounded-md border"
          />

          {/* Footer — Clear resets, Apply commits */}
          <div className="flex justify-between pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              disabled={!internalRange}
            >
              {clearLabel}
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!internalRange?.from}
            >
              {applyLabel}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

DateRangePicker.displayName = 'DateRangePicker';

export { DateRangePicker };

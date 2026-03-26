'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { Locale } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '../../utils';
import { Button } from '../Button/Button.web';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '../Popover/Popover.web';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../Select/Select.web';
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
  const [open, setOpen] = useState(false);
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(
    selected
  );
  const [month, setMonth] = useState<Date>(selected?.from ?? new Date());

  // Sync internal state when popover opens
  useEffect(() => {
    if (open) {
      setInternalRange(selected);
      setMonth(selected?.from ?? new Date());
    }
  }, [open, selected]);

  const handleApply = useCallback(() => {
    onApply?.(internalRange);
    setOpen(false);
  }, [internalRange, onApply]);

  const handleClear = useCallback(() => {
    setInternalRange(undefined);
    onApply?.(undefined);
    setOpen(false);
  }, [onApply]);

  const handleMonthChange = useCallback(
    (val: string) => {
      const newMonth = new Date(month.getFullYear(), Number(val), 1);
      setMonth(newMonth);
    },
    [month]
  );

  const handleYearChange = useCallback(
    (val: string) => {
      const newMonth = new Date(Number(val), month.getMonth(), 1);
      setMonth(newMonth);
    },
    [month]
  );

  const formatDate = useCallback(
    (date: Date) => format(date, dateFormat, { locale }),
    [dateFormat, locale]
  );

  const formattedValue = selected?.from
    ? selected.to && selected.from.getTime() !== selected.to.getTime()
      ? `${formatDate(selected.from)} – ${formatDate(selected.to)}`
      : formatDate(selected.from)
    : undefined;

  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="date-range-picker-trigger"
          className={cn(
            'flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm',
            'text-muted-foreground transition-colors duration-200',
            'hover:border-ring/40 hover:bg-muted/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'min-w-[180px]',
            formattedValue && 'text-foreground',
            className
          )}
        >
          <CalendarIcon className="size-3.5 shrink-0" />
          <span className="truncate">{formattedValue ?? placeholder}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        data-slot="date-range-picker-content"
        className="w-auto p-4"
        align="start"
      >
        <div className="space-y-4">
          {/* Month / Year dropdowns */}
          <div className="flex justify-between gap-2">
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

          {/* Calendar */}
          <Calendar
            mode="range"
            selected={internalRange}
            onSelect={setInternalRange}
            month={month}
            onMonthChange={setMonth}
            locale={locale}
            className="rounded-md border"
          />

          {/* Footer */}
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

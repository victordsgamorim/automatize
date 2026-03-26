'use client';

/**
 * Calendar — Date grid for single or range date selection.
 *
 * Wrapper around react-day-picker (v8) that replaces its default styles with
 * Tailwind classes using semantic design tokens. No CSS file is imported — all
 * styling is applied through the `classNames` prop.
 *
 * Supports three selection modes via the `mode` prop:
 *  - "single"  — pick one date
 *  - "range"   — pick a from → to range (highlights start, middle, end)
 *  - "multiple" — pick multiple individual dates
 *
 * Navigation icons (ChevronLeft/Right) come from lucide-react, and the day
 * button styling reuses `buttonVariants` from Button.web for visual consistency.
 *
 * Used by: DateRangePicker (as the calendar grid inside the popover).
 * Can also be used standalone for any date-picking UI.
 */

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { cn } from '../../utils';
import { buttonVariants } from '../Button/Button.web';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      className={cn('w-fit p-3', className)}
      classNames={{
        // Layout — month grid with responsive horizontal stacking
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',

        // Caption — centered month/year label with absolute-positioned nav arrows
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium capitalize',

        // Navigation — prev/next month buttons using outline button variant
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',

        // Table — the day grid
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',

        // Cell — container for each day button; handles range rounding
        cell: cn(
          'relative size-9 p-0 text-center text-sm focus-within:relative focus-within:z-20',
          '[&:has([aria-selected])]:bg-accent',
          '[&:has([aria-selected].day-range-end)]:rounded-r-md',
          '[&:has([aria-selected].day-outside)]:bg-accent/50',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md'
        ),
        // Day button — uses ghost button variant for consistent sizing
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-9 p-0 font-normal aria-selected:opacity-100'
        ),

        // Range markers — CSS class hooks used by cell rounding logic above
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',

        // Day state variants
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',

        // Allow consumer to override any classNames
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeftIcon className="size-4" />,
        IconRight: () => <ChevronRightIcon className="size-4" />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };

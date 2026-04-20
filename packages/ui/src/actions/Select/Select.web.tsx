'use client';

/**
 * Select — Form control for picking a single value from a list.
 *
 * Thin wrapper around @radix-ui/react-select that applies the design system's
 * semantic tokens, animation, and iconography. Unlike DropdownMenu (which is
 * an action menu with keyboard nav, submenus, and checkbox/radio items),
 * Select is a form control with native <select>-like accessibility semantics
 * (type-ahead search, value binding, placeholder support).
 *
 * Used by: DateRangePicker (month/year dropdowns), and any future form that
 * needs a styled value-selection dropdown.
 *
 * Exports:
 *  - Select                 — Root provider, manages value state.
 *  - SelectTrigger          — Button that opens the dropdown. Shows current
 *                             value + chevron icon.
 *  - SelectValue            — Displays the selected value text inside the trigger.
 *  - SelectContent          — Floating dropdown panel with scroll buttons.
 *  - SelectItem             — Individual selectable option with check indicator.
 *  - SelectGroup            — Groups related items (optional).
 *  - SelectLabel            — Label for a group of items (optional).
 *  - SelectSeparator        — Visual divider between items/groups.
 *  - SelectScrollUpButton   — Scroll indicator at the top of long lists.
 *  - SelectScrollDownButton — Scroll indicator at the bottom of long lists.
 */

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '../../utils';

/** Root provider — manages the selected value via `value` / `onValueChange`. */
function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>): React.JSX.Element {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

/** Groups related SelectItems together for accessibility. */
function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>): React.JSX.Element {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

/** Renders the currently selected value text inside the trigger. */
function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>): React.JSX.Element {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

/**
 * Trigger button — opens the dropdown and displays the current value.
 * Includes a ChevronDown icon. Styled with border, shadow, and focus ring
 * to match the design system's form control pattern.
 */
function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>): React.JSX.Element {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:min-w-0',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground/80" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/** Scroll indicator shown at the top when the list overflows. */
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<
  typeof SelectPrimitive.ScrollUpButton
>): React.JSX.Element {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

/** Scroll indicator shown at the bottom when the list overflows. */
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<
  typeof SelectPrimitive.ScrollDownButton
>): React.JSX.Element {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

/**
 * Floating dropdown panel — rendered in a Portal to escape parent stacking contexts.
 * Uses the "popper" position strategy by default, which aligns the dropdown width
 * to the trigger and adds directional slide offsets. Includes scroll up/down
 * buttons for long lists.
 */
function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>): React.JSX.Element {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-[8rem] overflow-hidden rounded-lg border shadow-lg shadow-black/5',
          position === 'popper' &&
            'w-full min-w-[var(--radix-select-trigger-width)] data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' && 'h-[var(--radix-select-trigger-height)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

/** Label for a group of items — rendered as a small, muted heading. */
function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>): React.JSX.Element {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        'py-1.5 pe-2 ps-8 text-xs font-medium text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * Individual selectable option — shows a check icon when selected.
 * Supports keyboard navigation and type-ahead search out of the box.
 */
function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>): React.JSX.Element {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pe-2 ps-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute start-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

/** Visual divider — renders a 1px horizontal line between items or groups. */
function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>): React.JSX.Element {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

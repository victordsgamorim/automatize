'use client';

/**
 * Popover — Generic floating content container.
 *
 * Thin wrapper around @radix-ui/react-popover that applies the design system's
 * semantic tokens and animation classes. Unlike DropdownMenu (which provides
 * keyboard-navigable action lists) or Select (which is a form control for
 * picking a value), Popover renders arbitrary content in a floating panel
 * anchored to a trigger element.
 *
 * Used by: DateRangePicker (calendar panel), and any future component that
 * needs a floating content area without built-in item navigation.
 *
 * Exports:
 *  - Popover        — Root provider, manages open/close state.
 *  - PopoverTrigger — Element that toggles the popover. Use `asChild` to
 *                     render a custom trigger instead of an extra <button>.
 *  - PopoverContent — The floating panel. Rendered via Portal so it escapes
 *                     parent overflow/z-index stacking contexts.
 *  - PopoverAnchor  — Optional alternative anchor point (positions the panel
 *                     relative to this element instead of the trigger).
 *  - PopoverClose   — Optional button that closes the popover when clicked.
 */

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '../../utils';

/** Root provider — controls open/close state via `open` / `onOpenChange`. */
function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>): React.JSX.Element {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

/** Trigger element — toggles the popover. Pass `asChild` to use a custom element. */
function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>): React.JSX.Element {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/** Alternative positioning anchor — the panel aligns to this instead of the trigger. */
function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>): React.JSX.Element {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

/**
 * Floating content panel — rendered in a Portal to escape parent stacking contexts.
 * Applies semantic tokens (bg-popover, text-popover-foreground) and slide/fade
 * animations that match the direction the panel opens from.
 */
function PopoverContent({
  className,
  align = 'start',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>): React.JSX.Element {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-auto min-w-[8rem] overflow-hidden rounded-lg border p-4 shadow-md outline-none',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

/** Close button — closes the popover when clicked. Optional convenience wrapper. */
function PopoverClose({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Close>): React.JSX.Element {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose };

'use client';

/**
 * CommandPalette — Keyboard-driven search and command interface.
 *
 * Built on top of `cmdk` (Command Menu) and `@radix-ui/react-dialog`.
 * Provides a spotlight-style UI where users can search, navigate, and
 * execute actions using keyboard shortcuts.
 *
 * Unlike other overlay components in the system:
 *  - Popover  → anchored to a trigger, no keyboard item navigation
 *  - Select   → form control for picking a single value
 *  - DropdownMenu → action menu with submenus and checkbox/radio items
 *  - CommandPalette → free-text search with fuzzy matching, grouped results,
 *                     and keyboard-first navigation (arrow keys + Enter)
 *
 * Uses @radix-ui/react-dialog directly (not the Popover wrapper) because the
 * command palette is a centered modal overlay with a backdrop — not a floating
 * panel anchored to a trigger element.
 *
 * Used by: SearchBar (wraps CommandDialog + CommandInput/List/Items).
 *
 * Exports:
 *  - Command          — Root command container with fuzzy search built in.
 *  - CommandDialog    — Modal wrapper (Dialog + overlay + Command). Includes
 *                       accessible Title and Description (screen-reader only).
 *  - CommandInput     — Search input with a magnifying glass icon.
 *  - CommandList      — Scrollable results container.
 *  - CommandEmpty     — Shown when no results match the search query.
 *  - CommandGroup     — Groups related items under a heading.
 *  - CommandItem      — Individual actionable result row.
 *  - CommandSeparator — Visual divider between groups.
 *  - CommandShortcut  — Right-aligned keyboard shortcut hint inside an item.
 *  - CommandLoading   — Loading indicator while results are being fetched.
 */

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Search } from 'lucide-react';

import { cn } from '../../utils';

/**
 * Root command container — wraps cmdk's Command primitive with design tokens.
 * Provides built-in fuzzy search and keyboard navigation across all items.
 */
function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>): React.JSX.Element {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md',
        className
      )}
      {...props}
    />
  );
}

/**
 * Modal dialog wrapper — renders a centered overlay with backdrop blur.
 * Uses @radix-ui/react-dialog (not Popover) because this is a full-screen
 * modal, not a trigger-anchored panel. Includes sr-only Title and Description
 * for WCAG compliance.
 */
function CommandDialog({
  children,
  title = 'Command Palette',
  description = 'Search or type a command',
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <DialogPrimitive.Root {...props}>
      <DialogPrimitive.Portal>
        {/* Backdrop — semi-transparent overlay with blur */}
        <DialogPrimitive.Overlay
          data-slot="command-dialog-overlay"
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        {/* Content — centered modal positioned at 20% from top */}
        <DialogPrimitive.Content
          data-slot="command-dialog-content"
          className="fixed left-1/2 top-[20%] z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border bg-popover shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2"
        >
          {/* Accessible title/description — hidden visually, read by screen readers */}
          <DialogPrimitive.Title className="sr-only">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {description}
          </DialogPrimitive.Description>
          <Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3">
            {children}
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Search input — includes a Search icon and transparent background. */
function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>): React.JSX.Element {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex items-center border-b px-3"
    >
      <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    </div>
  );
}

/** Scrollable results container — limits height and enables vertical scroll. */
function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>): React.JSX.Element {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn('max-h-80 overflow-y-auto overflow-x-hidden', className)}
      {...props}
    />
  );
}

/** Empty state — shown when no items match the current search query. */
function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>): React.JSX.Element {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(
        'py-6 text-center text-sm text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/** Group wrapper — organizes related items under a heading. */
function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>): React.JSX.Element {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium',
        className
      )}
      {...props}
    />
  );
}

/** Actionable result row — highlighted when selected via keyboard or hover. */
function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>): React.JSX.Element {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

/** Visual divider — 1px line between command groups. */
function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>): React.JSX.Element {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('bg-border -mx-1 h-px', className)}
      {...props}
    />
  );
}

/** Keyboard shortcut hint — right-aligned small text inside a command item. */
function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>): React.JSX.Element {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        'text-muted-foreground ml-auto text-xs tracking-widest',
        className
      )}
      {...props}
    />
  );
}

/** Loading indicator — shown while results are being fetched asynchronously. */
function CommandLoading({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Loading>): React.JSX.Element {
  return (
    <CommandPrimitive.Loading
      data-slot="command-loading"
      className={cn(
        'py-6 text-center text-sm text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  CommandLoading,
};

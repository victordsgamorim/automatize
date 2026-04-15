'use client';

/**
 * Kbd — Keyboard shortcut badge.
 *
 * Renders a styled <kbd> element for displaying keyboard shortcut hints
 * (e.g. "Esc", "Enter", "Ctrl+K"). Use inside buttons, triggers, or any
 * UI element to visually indicate available shortcuts.
 *
 * The shortcut itself is not wired up — this is a purely visual component.
 * The parent is responsible for implementing the actual keyboard behavior.
 *
 * Modifier order is always: Control → Shift → Alt → Key.
 * On macOS, "Ctrl" is replaced by "⌘".
 */

import * as React from 'react';

import { usePlatform } from '../../responsive';
import { cn } from '../../utils';

export interface KbdProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  /** The main key to display (e.g. "Enter", "K", "Esc"). Required. */
  keyLabel: string;
  /** Show Ctrl (Windows/Linux) or ⌘ (macOS) modifier. @default false */
  control?: boolean;
  /** Show Shift modifier. @default false */
  shift?: boolean;
  /** Show Alt modifier. @default false */
  alt?: boolean;
}

function Kbd({
  className,
  keyLabel,
  control = false,
  shift = false,
  alt = false,
  ...props
}: KbdProps): React.JSX.Element {
  const { isMac } = usePlatform();

  const parts: string[] = [];
  if (control) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shift) parts.push(isMac ? '⇧' : 'Shift');
  if (alt) parts.push(isMac ? '⌥' : 'Alt');
  parts.push(keyLabel);

  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground',
        className
      )}
      {...props}
    >
      {parts.join('+')}
    </kbd>
  );
}

function DestructiveKbd({ className, ...props }: KbdProps): React.JSX.Element {
  return (
    <Kbd
      className={cn(
        'border-transparent bg-on-destructive text-on-destructive-foreground',
        className
      )}
      {...props}
    />
  );
}

export { Kbd, DestructiveKbd };

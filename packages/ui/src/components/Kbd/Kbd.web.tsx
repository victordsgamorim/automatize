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
 */

import * as React from 'react';

import { cn } from '../../utils';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

function Kbd({ className, children, ...props }: KbdProps): React.JSX.Element {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export { Kbd };

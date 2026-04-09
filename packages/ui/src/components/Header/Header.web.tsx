'use client';

import React from 'react';
import { cn } from '../../utils';

export interface HeaderProps {
  /** Page title shown on the left. */
  title: string;
  /** Action buttons (e.g. DateRangePicker + SearchBar) shown on the right. */
  actions?: React.ReactNode;
  className?: string;
}

export function Header({
  title,
  actions,
  className,
}: HeaderProps): React.JSX.Element {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border',
        'bg-background/95 supports-[backdrop-filter]:bg-background/50 backdrop-blur-lg',
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <span className="text-xl font-semibold text-foreground truncate">
          {title}
        </span>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </header>
  );
}

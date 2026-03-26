'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Search, Command as CommandIcon } from 'lucide-react';

import { cn } from '../../utils';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
} from '../../actions/CommandPalette/CommandPalette.web';

export interface SearchBarProps {
  /** Placeholder text for the trigger button and search input */
  placeholder?: string;
  /** Text shown when no results match */
  emptyMessage?: string;
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void;
  /** Additional className for the trigger button */
  className?: string;
  /** Content to render in the results area */
  children?: React.ReactNode;
}

function SearchBar({
  placeholder = 'Search...',
  emptyMessage = 'No results found.',
  onSearchChange,
  className,
  children,
}: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(
      typeof navigator !== 'undefined' &&
        /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleValueChange = useCallback(
    (value: string) => {
      onSearchChange?.(value);
    },
    [onSearchChange]
  );

  return (
    <>
      <button
        type="button"
        data-slot="search-bar-trigger"
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm',
          'text-muted-foreground transition-colors duration-200',
          'hover:border-ring/40 hover:bg-muted/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'min-w-56',
          className
        )}
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">{placeholder}</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          {isMac ? <CommandIcon className="size-3" /> : <span>Ctrl</span>}
          <span>K</span>
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={placeholder}
        description={`Press Escape to close`}
      >
        <CommandInput
          placeholder={placeholder}
          onValueChange={handleValueChange}
        />
        <CommandList>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          {children}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export { SearchBar };

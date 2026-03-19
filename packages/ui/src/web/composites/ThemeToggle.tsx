'use client';

/**
 * ThemeToggle Composite
 * Light/dark mode toggle button.
 * Receives theme state via props — no dependency on @automatize/theme.
 */

import { Moon, Sun } from 'lucide-react';
import { Button } from '../../components/Button';

export interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="gap-2"
    >
      {isDark ? (
        <>
          <Sun className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </Button>
  );
}

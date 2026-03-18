'use client';

/**
 * ThemeToggle Composite
 * Light/dark mode toggle button
 */

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme ?? (isDark ? 'dark' : 'light');

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="gap-2"
    >
      {theme === 'light' ? (
        <>
          <Moon className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <Sun className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </Button>
  );
}

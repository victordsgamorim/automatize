'use client';

/**
 * @automatize/ui — Composites
 * Reusable generic composite components built on top of @automatize/ui/web primitives.
 * These composites are NOT domain-specific and can be used across all web apps.
 */

export { EmptyState } from './EmptyState';
export { ErrorState } from './ErrorState';
export { StatsCard } from './StatsCard';
export { ThemeToggle } from './ThemeToggle';
export { ThemeSwitcher } from './ThemeSwitcher';
export type {
  ThemeSwitcherProps,
  ThemeSwitcherOption,
  ThemePreferenceOption,
} from './ThemeSwitcher';

'use client';

/**
 * @automatize/ui — Web entry point
 * Re-exports components from src/components/ for web consumers.
 * Only exports what is actively used. New exports are added as features are built.
 */

// Utilities
export { cn } from './utils';

// Components (source of truth: src/components/)
export { Button, buttonVariants } from './components/Button';
export { Input } from './components/Input';
export { Label } from './components/Label';
export { Checkbox } from './components/Checkbox';
export { useToasts, ToastProvider } from './components/Toast';
export type { ToastType } from './components/Toast';
export { LanguageSwitcher } from './components/LanguageSwitcher';
export type {
  LanguageSwitcherProps,
  LanguageOption,
} from './components/LanguageSwitcher';

/**
 * @automatize/ui — Web entry point
 * Re-exports components from the source of truth (src/components/) for web consumers.
 * Only exports what is actively used. New exports are added here as features are built.
 */

// Utilities
export { cn } from './utils';
export { useIsMobile } from './use-mobile';

// Components (source of truth: src/components/)
export { Button, buttonVariants } from '../components/Button';
export { Input } from '../components/Input';
export { Label } from '../components/Label';
export { Checkbox } from '../components/Checkbox';
export { useToasts, ToastProvider } from '../components/Toast';
export type { ToastType } from '../components/Toast';
export { LanguageSwitcher } from '../components/LanguageSwitcher';
export type {
  LanguageSwitcherProps,
  LanguageOption,
} from '../components/LanguageSwitcher';

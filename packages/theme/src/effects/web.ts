import type { Theme } from '../types';

/**
 * Applies the resolved theme to the DOM (web).
 * Toggles the 'dark' class on <html> for Tailwind CSS.
 */
export function applyThemeEffect(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

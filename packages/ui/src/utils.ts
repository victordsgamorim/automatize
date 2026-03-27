import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sharedBreakpoints = {
  /**
   * Tailwind classes to collapse a trigger button (like Search or DatePicker)
   * into just its icon on mobile, but keep it expanded (min-w-180px) on sm+
   */
  triggerContainer: 'sm:min-w-[180px]',
  triggerText: 'hidden sm:inline truncate',
  triggerKbd: 'hidden sm:inline-flex',
  triggerIcon: 'shrink-0',
};

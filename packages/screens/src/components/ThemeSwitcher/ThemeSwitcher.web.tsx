'use client';

/**
 * ThemeSwitcher Component
 * Dropdown menu with Light / Dark / System options.
 * Receives theme state via props — no dependency on @automatize/theme.
 */

import React from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@automatize/ui/web';

export type ThemePreferenceOption = 'light' | 'dark' | 'system';

export interface ThemeSwitcherOption {
  value: ThemePreferenceOption;
  label: string;
}

export interface ThemeSwitcherProps {
  /** Currently selected preference */
  currentPreference: ThemePreferenceOption;
  /** Whether the resolved theme is dark (controls trigger icon) */
  isDark: boolean;
  /** Available options — if omitted, defaults to light/dark/system */
  options?: ThemeSwitcherOption[];
  /** Called when the user picks an option */
  onPreferenceChange: (preference: ThemePreferenceOption) => void;
  /** Accessible label for the trigger button */
  triggerAriaLabel?: string;
}

const ICON_MAP: Record<ThemePreferenceOption, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const DEFAULT_OPTIONS: ThemeSwitcherOption[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function ThemeSwitcher({
  currentPreference,
  isDark,
  options = DEFAULT_OPTIONS,
  onPreferenceChange,
  triggerAriaLabel = 'Change theme',
}: ThemeSwitcherProps) {
  const TriggerIcon = isDark ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={triggerAriaLabel}
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 h-[34px] rounded-lg border border-border/50 hover:border-border hover:bg-accent/50"
        >
          <TriggerIcon className="w-3.5 h-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {options.map((option) => {
          const Icon = ICON_MAP[option.value];
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onPreferenceChange(option.value)}
              className="flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{option.label}</span>
              </div>
              {option.value === currentPreference && (
                <Check className="w-3.5 h-3.5 opacity-70" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

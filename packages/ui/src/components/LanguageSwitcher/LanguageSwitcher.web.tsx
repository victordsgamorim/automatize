'use client';

import React from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../web/dropdown-menu';

export interface LanguageOption {
  /** BCP-47 language code, e.g. "en" or "pt-BR" */
  code: string;
  /** Full display name shown in the dropdown list, e.g. "English" */
  label: string;
  /** Short country/region extension shown in the trigger, e.g. "US" or "BR" */
  ext?: string;
}

export interface LanguageSwitcherProps {
  languages: LanguageOption[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  /** Accessible label for the trigger button */
  triggerAriaLabel?: string;
}

export function LanguageSwitcher({
  languages,
  currentLanguage,
  onLanguageChange,
  triggerAriaLabel,
}: LanguageSwitcherProps) {
  const currentOption = languages.find((l) => l.code === currentLanguage);
  const triggerCode =
    currentOption?.ext ??
    (currentOption?.code ?? currentLanguage).split('-')[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={triggerAriaLabel}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg border border-border/50 hover:border-border hover:bg-accent/50"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{triggerCode}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className="flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {lang.ext && (
                <span className="text-xs font-semibold text-muted-foreground w-6">
                  {lang.ext}
                </span>
              )}
              <span>{lang.label}</span>
            </div>
            {lang.code === currentLanguage && (
              <Check className="w-3.5 h-3.5 opacity-70" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

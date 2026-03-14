'use client';

/**
 * Text Component — Web
 * Semantic text element with typography variants
 */

import * as React from 'react';
import { cn } from '../web/utils';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'code';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'error'
  | 'success'
  | 'warning';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  className?: string;
}

const variantTag: Record<TextVariant, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  bodySmall: 'p',
  caption: 'span',
  code: 'code',
};

const variantClass: Record<TextVariant, string> = {
  h1: 'text-3xl font-bold leading-tight',
  h2: 'text-2xl font-bold leading-snug',
  h3: 'text-xl font-semibold leading-snug',
  body: 'text-base font-normal leading-relaxed',
  bodySmall: 'text-sm font-normal leading-relaxed',
  caption: 'text-xs font-normal leading-normal',
  code: 'text-sm font-medium font-mono',
};

const colorClass: Record<TextColor, string> = {
  primary: 'text-foreground',
  secondary: 'text-muted-foreground',
  tertiary: 'text-muted-foreground/70',
  error: 'text-destructive',
  success: 'text-[var(--success)]',
  warning: 'text-[var(--warning)]',
};

export function Text({
  children,
  variant = 'body',
  color = 'primary',
  className,
  ...props
}: TextProps) {
  const Tag = variantTag[variant] as React.ElementType;
  return (
    <Tag
      className={cn(variantClass[variant], colorClass[color], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

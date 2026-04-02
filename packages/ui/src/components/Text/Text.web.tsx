'use client';

/**
 * Text Component — Web
 *
 * Unified text primitive for web. Renders semantic HTML elements based on
 * the `variant` prop (h1–h3 → <h1>–<h3>, body/bodySmall/caption/code → <span>).
 *
 * When `htmlFor` is provided the component renders a <label> element,
 * covering the form-label use-case previously handled by the Label component.
 */

import * as React from 'react';
import { cn } from '../../utils';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'code'
  | 'label';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'muted'
  | 'error'
  | 'success'
  | 'warning';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Typography variant — determines the rendered HTML element and default styles */
  variant?: TextVariant;
  /** Text color */
  color?: TextColor;
  /** When provided, renders a <label> element associated with this form control id */
  htmlFor?: string;
  /** Additional class names */
  className?: string;
  children?: React.ReactNode;
}

const variantStyles: Record<TextVariant, string> = {
  h1: 'text-4xl font-bold leading-9',
  h2: 'text-2xl font-bold leading-8',
  h3: 'text-xl font-semibold leading-7',
  body: 'text-base font-normal leading-6',
  bodySmall: 'text-sm font-normal leading-5',
  caption: 'text-xs font-normal leading-4',
  code: 'text-sm font-medium font-mono',
  label:
    'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
};

const colorStyles: Record<TextColor, string> = {
  primary: 'text-foreground',
  secondary: 'text-foreground/80',
  tertiary: 'text-foreground/60',
  muted: 'text-muted-foreground',
  error: 'text-destructive',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
};

/** Determines the default HTML element for each variant */
const variantElement: Record<TextVariant, keyof React.JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'span',
  bodySmall: 'span',
  caption: 'span',
  code: 'code',
  label: 'label',
};

const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      variant = 'body',
      color = 'primary',
      htmlFor,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // When htmlFor is provided, always render as <label> and use label styles
    const effectiveVariant = htmlFor ? 'label' : variant;
    const Tag = htmlFor ? 'label' : variantElement[effectiveVariant];

    return React.createElement(
      Tag,
      {
        ref,
        ...(htmlFor ? { htmlFor } : {}),
        'data-slot': 'text',
        className: cn(
          variantStyles[effectiveVariant],
          colorStyles[color],
          className
        ),
        ...props,
      },
      children
    );
  }
);

Text.displayName = 'Text';

export { Text };

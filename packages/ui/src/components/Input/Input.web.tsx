'use client';

/**
 * Input Component — Web
 *
 * Unified form input for web. Renders a styled <input> element.
 * When `label` is provided, wraps the input with a <Text> label and
 * consistent spacing (absorbing the former FormField responsibility).
 * When `error` is provided, displays an error message below the input.
 */

import * as React from 'react';
import { cn } from '../../utils';
import { Text } from '../Text/Text.web';

export interface InputProps extends React.ComponentProps<'input'> {
  /** Label displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Wrapper className (applied to the outer <div> when label or error is present) */
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, wrapperClassName, id, ...props }, ref) => {
    const inputElement = (
      <input
        ref={ref}
        id={id}
        type={type}
        data-slot="input"
        aria-invalid={error ? true : undefined}
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-10 w-full min-w-0 rounded-lg border border-border bg-foreground/5 backdrop-blur-sm px-3 py-2 text-sm shadow-sm shadow-black/5 transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:border-violet-400/70 focus-visible:bg-violet-500/10',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className
        )}
        {...props}
      />
    );

    if (!label && !error) return inputElement;

    return (
      <div className={cn('space-y-1.5', wrapperClassName)}>
        {label && (
          <Text htmlFor={id} color="muted" className="pl-3">
            {label}
          </Text>
        )}
        {inputElement}
        {error && (
          <Text variant="caption" color="error" className="pl-3">
            {error}
          </Text>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

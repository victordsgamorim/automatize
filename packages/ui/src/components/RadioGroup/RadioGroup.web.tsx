'use client';

/**
 * RadioGroup — Form control for selecting one option from a set.
 *
 * Thin wrapper around @radix-ui/react-radio-group that applies the design
 * system's semantic tokens and styling. Supports horizontal and vertical
 * orientation.
 *
 * Exports:
 *  - RadioGroup     — Root provider, manages selected value state.
 *  - RadioGroupItem — Individual radio option with circle indicator.
 */

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

import { cn } from '../../utils';

function RadioGroup({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>): React.JSX.Element {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn(
        orientation === 'horizontal'
          ? 'flex flex-row gap-4'
          : 'flex flex-col gap-2',
        className
      )}
      orientation={orientation}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>): React.JSX.Element {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'peer border border-border bg-foreground/5 backdrop-blur-sm data-[state=checked]:border-primary focus-visible:border-violet-400/70 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-5 shrink-0 rounded-full shadow-xs transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <span className="size-2.5 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };

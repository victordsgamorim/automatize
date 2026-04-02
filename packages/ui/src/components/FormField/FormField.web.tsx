'use client';

/**
 * FormField Component — Web
 * Wraps a Label + input child with consistent spacing and label indentation.
 */

import * as React from 'react';
import { cn } from '../../utils';
import { Text } from '../Text/Text.web';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Text htmlFor={htmlFor} color="muted" className="pl-4">
        {label}
      </Text>
      {children}
    </div>
  );
}

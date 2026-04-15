'use client';

import * as React from 'react';
import { Button, type ButtonProps } from './Button.web';

export type DestructiveButtonProps = Omit<ButtonProps, 'variant'>;

export function DestructiveButton(
  props: DestructiveButtonProps
): React.JSX.Element {
  return <Button variant="destructive" {...props} />;
}

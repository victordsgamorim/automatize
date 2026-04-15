'use client';

import * as React from 'react';
import { Button, type ButtonProps } from './Button.web';

export type SecondaryButtonProps = Omit<ButtonProps, 'variant'>;

export function SecondaryButton(
  props: SecondaryButtonProps
): React.JSX.Element {
  return <Button variant="secondary" {...props} />;
}

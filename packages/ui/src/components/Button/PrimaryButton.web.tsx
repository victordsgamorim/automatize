'use client';

import * as React from 'react';
import { Button, type ButtonProps } from './Button.web';

export type PrimaryButtonProps = Omit<ButtonProps, 'variant'>;

export function PrimaryButton(props: PrimaryButtonProps): React.JSX.Element {
  return <Button variant="default" {...props} />;
}

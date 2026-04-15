import React from 'react';
import { Button, type ButtonProps } from './Button.native';

export type PrimaryButtonProps = Omit<ButtonProps, 'variant'>;

export const PrimaryButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  PrimaryButtonProps
>((props, ref) => <Button ref={ref} variant="primary" {...props} />);

PrimaryButton.displayName = 'PrimaryButton';

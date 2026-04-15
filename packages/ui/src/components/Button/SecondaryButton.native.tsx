import React from 'react';
import { Button, type ButtonProps } from './Button.native';

export type SecondaryButtonProps = Omit<ButtonProps, 'variant'>;

export const SecondaryButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  SecondaryButtonProps
>((props, ref) => <Button ref={ref} variant="secondary" {...props} />);

SecondaryButton.displayName = 'SecondaryButton';

import React from 'react';
import { Button, type ButtonProps } from './Button.native';

export type DestructiveButtonProps = Omit<ButtonProps, 'variant'>;

export const DestructiveButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  DestructiveButtonProps
>((props, ref) => <Button ref={ref} variant="danger" {...props} />);

DestructiveButton.displayName = 'DestructiveButton';

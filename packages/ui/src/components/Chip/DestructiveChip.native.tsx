import React from 'react';
import { Chip, type ChipProps } from './Chip.native';

export type DestructiveChipProps = Omit<ChipProps, 'variant'>;

export function DestructiveChip(
  props: DestructiveChipProps
): React.JSX.Element {
  return <Chip variant="destructive" {...props} />;
}

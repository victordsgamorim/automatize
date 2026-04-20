import React from 'react';
import { Chip, type ChipProps } from './Chip.native';

export type PrimaryChipProps = Omit<ChipProps, 'variant'>;

export function PrimaryChip(props: PrimaryChipProps): React.JSX.Element {
  return <Chip variant="primary" {...props} />;
}

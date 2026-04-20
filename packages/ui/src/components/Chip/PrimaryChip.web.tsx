'use client';

import * as React from 'react';
import { Chip, type ChipProps } from './Chip.web';

export type PrimaryChipProps = Omit<ChipProps, 'variant'>;

export function PrimaryChip(props: PrimaryChipProps): React.JSX.Element {
  return <Chip variant="primary" {...props} />;
}

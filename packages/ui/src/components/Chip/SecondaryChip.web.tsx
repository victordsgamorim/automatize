'use client';

import * as React from 'react';
import { Chip, type ChipProps } from './Chip.web';

export type SecondaryChipProps = Omit<ChipProps, 'variant'>;

export function SecondaryChip(props: SecondaryChipProps): React.JSX.Element {
  return <Chip variant="secondary" {...props} />;
}

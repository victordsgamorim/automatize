'use client';

import * as React from 'react';
import { Chip, type ChipProps } from './Chip.web';

export type DestructiveChipProps = Omit<ChipProps, 'variant'>;

export function DestructiveChip(
  props: DestructiveChipProps
): React.JSX.Element {
  return <Chip variant="destructive" {...props} />;
}

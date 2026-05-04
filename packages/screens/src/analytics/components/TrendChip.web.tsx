import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface TrendChipProps {
  /** Decimal delta (e.g. 0.125 = +12.5%) */
  pct: number;
  /** Localized context, e.g. "vs last month" */
  label: string;
}

const formatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  signDisplay: 'exceptZero',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const TrendChip: React.FC<TrendChipProps> = ({ pct, label }) => {
  const formatted = formatter.format(pct);
  const direction = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';

  const tone =
    direction === 'up'
      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
      : direction === 'down'
        ? 'bg-destructive/10 text-destructive'
        : 'bg-muted text-muted-foreground';

  const Icon =
    direction === 'up'
      ? ArrowUpRight
      : direction === 'down'
        ? ArrowDownRight
        : Minus;

  const ariaLabel = `${formatted} ${label}`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}
      aria-label={ariaLabel}
      title={label}
    >
      <Icon className="size-3" aria-hidden="true" />
      {formatted}
    </span>
  );
};

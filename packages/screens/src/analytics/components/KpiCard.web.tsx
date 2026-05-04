import React from 'react';
import { Card, Text } from '@automatize/ui/web';
import { TrendChip } from './TrendChip.web';

export type KpiCardSize = 'compact' | 'default' | 'hero';
export type KpiAccent = 'primary' | 'success' | 'warning' | 'info';

export interface KpiTrend {
  /** Decimal delta (e.g. 0.125 = +12.5%) */
  pct: number;
  /** Localized context label, e.g. "vs last month" */
  label: string;
}

interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description?: string;
  size?: KpiCardSize;
  accent?: KpiAccent;
  trend?: KpiTrend;
  /** Hero-only slot rendered between value and description (e.g. sparkline) */
  children?: React.ReactNode;
}

const ACCENT_CLASSES: Record<KpiAccent, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-green-500/10 text-green-600 dark:text-green-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

const ACCENT_TEXT_ONLY: Record<KpiAccent, string> = {
  primary: 'text-primary',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
};

const ICON_BOX_SIZE: Record<KpiCardSize, string> = {
  compact: 'size-8',
  default: 'size-9',
  hero: 'size-10',
};

export const KpiCard: React.FC<KpiCardProps> = ({
  icon,
  title,
  value,
  description,
  size = 'default',
  accent = 'primary',
  trend,
  children,
}) => {
  const accentClass = ACCENT_CLASSES[accent];
  const iconSize = ICON_BOX_SIZE[size];

  if (size === 'compact') {
    return (
      <Card padding="md" elevation={1} className="h-full">
        <div className="flex h-full items-start gap-3">
          <div
            className={`flex ${iconSize} shrink-0 items-center justify-center rounded-md ${accentClass}`}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <Text
                variant="label"
                className="block text-muted-foreground text-xs"
              >
                {title}
              </Text>
              {trend ? <TrendChip pct={trend.pct} label={trend.label} /> : null}
            </div>
            <p className="mt-1 truncate text-xl font-bold text-foreground tracking-tight">
              {value}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (size === 'hero') {
    return (
      <Card padding="lg" elevation={1} className="h-full">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex ${iconSize} shrink-0 items-center justify-center rounded-md ${accentClass}`}
              >
                {icon}
              </div>
              <Text
                variant="label"
                className="block text-sm font-semibold text-muted-foreground"
              >
                {title}
              </Text>
            </div>
            {trend ? <TrendChip pct={trend.pct} label={trend.label} /> : null}
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground tracking-tight lg:text-4xl">
            {value}
          </p>
          {children ? (
            <div className={`mt-3 ${ACCENT_TEXT_ONLY[accent]}`}>{children}</div>
          ) : null}
          {description ? (
            <>
              <div className="mt-3 h-px w-full bg-border" />
              <Text
                variant="label"
                className="mt-3 block text-sm text-muted-foreground"
              >
                {description}
              </Text>
            </>
          ) : null}
        </div>
      </Card>
    );
  }

  // size === 'default'
  return (
    <Card padding="md" elevation={1} className="h-full">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-2">
          <div
            className={`flex ${iconSize} shrink-0 items-center justify-center rounded-md ${accentClass}`}
          >
            {icon}
          </div>
          {trend ? <TrendChip pct={trend.pct} label={trend.label} /> : null}
        </div>
        <div className="mt-3">
          <Text variant="label" className="block text-muted-foreground text-xs">
            {title}
          </Text>
          <p className="mt-1 text-2xl font-bold text-foreground tracking-tight">
            {value}
          </p>
          {description ? (
            <Text
              variant="label"
              className="block text-muted-foreground text-xs mt-1"
            >
              {description}
            </Text>
          ) : null}
        </div>
      </div>
    </Card>
  );
};

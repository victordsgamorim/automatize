'use client';

/**
 * StatsCard Composite
 * Displays a metric/KPI with optional trend indicator and loading skeleton
 */

import { LucideIcon } from 'lucide-react';
import { Skeleton } from '../skeleton';
import { cn } from '../utils';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  isLoading = false,
  className,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn('bg-card border border-border rounded-lg p-6', className)}
      >
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="size-10 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-6 transition-all hover:border-border/80',
        className
      )}
      role="region"
      aria-label={`${title} statistics`}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-muted-foreground">{title}</p>
        <div className="bg-primary/5 p-2.5 rounded-lg" aria-hidden="true">
          <Icon className="size-5 text-primary" />
        </div>
      </div>
      <div className="space-y-1">
        <h2
          className="text-3xl tracking-tight"
          aria-label={`${title}: ${value}`}
        >
          {value}
        </h2>
        {trend && (
          <p className="text-sm text-muted-foreground">
            <span
              className={cn(
                'inline-flex items-center gap-1',
                trend.isPositive
                  ? 'text-[var(--success)]'
                  : 'text-[var(--destructive)]'
              )}
              aria-label={`${trend.isPositive ? 'Increased' : 'Decreased'} by ${trend.value}`}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </span>
            <span className="ml-1">vs last month</span>
          </p>
        )}
      </div>
    </div>
  );
}

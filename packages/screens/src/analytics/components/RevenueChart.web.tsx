import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonthRevenuePoint } from '../hooks/useAnalyticsData';

const PRIMARY = '#2563EB';
const GRID = '#e2e8f0';
const AXIS_TICK = '#94A3B8';
const CHART_HEIGHT = 192;

function compactValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(Math.round(v));
}

interface RevenueChartProps {
  data: MonthRevenuePoint[];
  formatValue: (v: number) => string;
  noDataLabel: string;
  tooltipLabel: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  formatValue,
  noDataLabel,
  tooltipLabel,
}) => {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        {noDataLabel}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.2} />
            <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: AXIS_TICK }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={compactValue}
          tick={{ fontSize: 11, fill: AXIS_TICK }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          formatter={(value) => [formatValue(value as number), tooltipLabel]}
          contentStyle={{ fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={PRIMARY}
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

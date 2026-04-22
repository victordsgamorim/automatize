import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonthCountPoint } from '../hooks/useAnalyticsData';

const PRIMARY = '#2563EB';
const GRID = '#e2e8f0';
const AXIS_TICK = '#94A3B8';
const CHART_HEIGHT = 192;

interface InvoicesChartProps {
  data: MonthCountPoint[];
  noDataLabel: string;
  tooltipLabel: string;
}

export const InvoicesChart: React.FC<InvoicesChartProps> = ({
  data,
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
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: AXIS_TICK }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: AXIS_TICK }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          formatter={(value) => [value, tooltipLabel]}
          contentStyle={{ fontSize: 12 }}
        />
        <Bar
          dataKey="count"
          fill={PRIMARY}
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

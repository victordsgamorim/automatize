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
import type { NameValueItem } from '../hooks/useAnalyticsData';

const PRIMARY = '#2563EB';
const GRID = '#e2e8f0';
const AXIS_TICK = '#64748B';
const BAR_HEIGHT = 40;
const CHART_MIN_HEIGHT = 120;

interface HorizontalBarChartProps {
  data: NameValueItem[];
  noDataLabel: string;
  tooltipLabel?: string;
  formatValue?: (v: number) => string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  noDataLabel,
  tooltipLabel,
  formatValue,
}) => {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        {noDataLabel}
      </div>
    );
  }

  const chartHeight = Math.max(CHART_MIN_HEIGHT, data.length * BAR_HEIGHT + 24);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: AXIS_TICK }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatValue ?? ((v) => String(v))}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 12, fill: AXIS_TICK }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) => [
            formatValue ? formatValue(value as number) : value,
            tooltipLabel ?? '',
          ]}
          contentStyle={{ fontSize: 12 }}
        />
        <Bar
          dataKey="value"
          fill={PRIMARY}
          radius={[0, 4, 4, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

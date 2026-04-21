import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ClientTypeItem } from '../hooks/useAnalyticsData';

const PIE_COLORS = ['#2563EB', '#16A34A'];
const CHART_HEIGHT = 192;

interface ClientTypeChartProps {
  data: ClientTypeItem[];
  /** Translated labels keyed by type ('individual' | 'business') */
  typeLabels: Record<string, string>;
  noDataLabel: string;
}

export const ClientTypeChart: React.FC<ClientTypeChartProps> = ({
  data,
  typeLabels,
  noDataLabel,
}) => {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        {noDataLabel}
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: typeLabels[d.type] ?? d.type,
    value: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={80}
          dataKey="value"
          nameKey="name"
          paddingAngle={3}
        >
          {chartData.map((_entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={PIE_COLORS[index % PIE_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12 }} />
        <Legend
          iconSize={10}
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

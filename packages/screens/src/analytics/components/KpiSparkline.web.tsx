import React, { useId } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { MonthRevenuePoint } from '../hooks/useAnalyticsData';

interface KpiSparklineProps {
  data: MonthRevenuePoint[];
  /** CSS color (e.g. 'currentColor' or '#2563EB'). Defaults to currentColor so the sparkline inherits the card's accent. */
  color?: string;
  height?: number;
}

const DEFAULT_HEIGHT = 56;

export const KpiSparkline: React.FC<KpiSparklineProps> = ({
  data,
  color = 'currentColor',
  height = DEFAULT_HEIGHT,
}) => {
  const gradientId = useId();

  if (data.length < 2) return null;

  return (
    <div aria-hidden="true" className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

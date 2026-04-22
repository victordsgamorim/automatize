import React from 'react';
import { Card, Text } from '@automatize/ui/web';

interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  icon,
  title,
  value,
  description,
}) => {
  return (
    <Card padding="md" elevation={1}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
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
    </Card>
  );
};

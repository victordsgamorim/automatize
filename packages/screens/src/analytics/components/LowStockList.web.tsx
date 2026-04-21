import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { Text } from '@automatize/ui/web';
import type { LowStockItem } from '../hooks/useAnalyticsData';

interface LowStockListProps {
  products: LowStockItem[];
  emptyLabel: string;
  unitLabel: string;
}

function stockBadgeClass(quantity: number): string {
  if (quantity === 0) return 'bg-destructive/10 text-destructive';
  if (quantity <= 2) return 'bg-orange-500/10 text-orange-600';
  return 'bg-yellow-500/10 text-yellow-700';
}

export const LowStockList: React.FC<LowStockListProps> = ({
  products,
  emptyLabel,
  unitLabel,
}) => {
  if (products.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <Package className="size-8 text-muted-foreground/40" />
        <span>{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2"
        >
          <div className="flex min-w-0 items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-yellow-500" />
            <div className="min-w-0">
              <Text variant="body" className="block truncate font-medium">
                {product.name}
              </Text>
              {product.companyName ? (
                <Text
                  variant="label"
                  className="block truncate text-xs text-muted-foreground"
                >
                  {product.companyName}
                </Text>
              ) : null}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${stockBadgeClass(product.quantity)}`}
          >
            {product.quantity} {unitLabel}
          </span>
        </div>
      ))}
    </div>
  );
};

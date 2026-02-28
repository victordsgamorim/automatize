import { cn } from '../ui/utils';

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft';

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  paid: {
    label: 'Paid',
    className: 'bg-[var(--success)] text-[var(--success-foreground)]',
  },
  pending: {
    label: 'Pending',
    className: 'bg-[var(--warning)] text-[var(--warning-foreground)]',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
  },
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors',
        config.className,
        className
      )}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      <span className="text-sm">{config.label}</span>
    </span>
  );
}

import { FileText, AlertCircle, Inbox } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'error';
}

const variantConfig = {
  default: {
    icon: Inbox,
    iconClassName: 'text-muted-foreground',
  },
  search: {
    icon: FileText,
    iconClassName: 'text-muted-foreground',
  },
  error: {
    icon: AlertCircle,
    iconClassName: 'text-[var(--destructive)]',
  },
};

export function EmptyState({
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-full bg-muted p-6 mb-4" aria-hidden="true">
        <Icon className={`size-10 ${config.iconClassName}`} />
      </div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

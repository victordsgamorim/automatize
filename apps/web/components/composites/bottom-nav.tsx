import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { page: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { page: 'invoices', icon: FileText, label: 'Invoices' },
  { page: 'clients', icon: Users, label: 'Clients' },
  { page: 'reports', icon: BarChart3, label: 'Reports' },
  { page: 'settings', icon: Settings, label: 'Settings' },
];

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

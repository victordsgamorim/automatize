/**
 * Composite Components
 *
 * Generic composites (EmptyState, ErrorState, StatsCard, ThemeToggle) have been
 * moved to @automatize/ui/composites and are re-exported here for convenience.
 *
 * Domain-specific composites (AppSidebar, InvoiceTable, StatusBadge, BottomNav)
 * remain here as they are tightly coupled to business domain logic.
 */

// Generic composites — sourced from @automatize/ui/composites
export {
  EmptyState,
  ErrorState,
  StatsCard,
  ThemeToggle,
} from '@automatize/ui/composites';

// Domain-specific composites
export { AppSidebar } from './app-sidebar';
export { BottomNav } from './bottom-nav';
export { InvoiceTable } from './invoice-table';
export type { Invoice } from './invoice-table';
export { StatusBadge } from './status-badge';
export type { InvoiceStatus } from './status-badge';

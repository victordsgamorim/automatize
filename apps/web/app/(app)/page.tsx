'use client';

import { SearchBar } from '@automatize/ui/web';
import { useTranslation } from '@automatize/localization';

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <SearchBar
          placeholder={t('search.placeholder')}
          emptyMessage={t('search.no-results')}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {['Revenue', 'Invoices', 'Clients', 'Products'].map((title) => (
          <div key={title} className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">--</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm h-64">
          <p className="text-sm text-muted-foreground">Chart placeholder</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm h-64">
          <p className="text-sm text-muted-foreground">Recent activity</p>
        </div>
      </div>
    </div>
  );
}

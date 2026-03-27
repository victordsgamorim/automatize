'use client';

import { useState, useMemo } from 'react';
import { DateRangePicker, SearchBar } from '@automatize/ui/web';
import type { DateRange } from '@automatize/ui/web';
import { useTranslation } from '@automatize/localization';
import { ptBR } from 'date-fns/locale/pt-BR';

export function DashboardMobileActions() {
  const { t, i18n } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const dateFnsLocale = useMemo(
    () => (i18n.language === 'pt-BR' ? ptBR : undefined),
    [i18n.language]
  );

  return (
    <>
      <DateRangePicker
        selected={dateRange}
        onApply={setDateRange}
        placeholder={t('calendar.placeholder')}
        clearLabel={t('calendar.clear')}
        applyLabel={t('calendar.apply')}
        locale={dateFnsLocale}
      />
      <SearchBar
        placeholder={t('search.placeholder')}
        emptyMessage={t('search.no-results')}
      />
    </>
  );
}

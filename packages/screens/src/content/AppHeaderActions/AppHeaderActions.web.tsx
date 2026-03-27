'use client';

import { useMemo, useState } from 'react';
import { DateRangePicker, SearchBar } from '@automatize/ui/web';
import type { DateRange } from '@automatize/ui/web';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { AppHeaderActionsProps } from './AppHeaderActions.types';

export type { AppHeaderActionsProps } from './AppHeaderActions.types';

export function AppHeaderActions({
  locale,
  dateRangePickerProps,
  searchBarProps,
}: AppHeaderActionsProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const dateFnsLocale = useMemo(
    () => (locale.code === 'pt-BR' ? ptBR : undefined),
    [locale.code]
  );

  return (
    <>
      <DateRangePicker
        selected={dateRange}
        onApply={setDateRange}
        locale={dateFnsLocale}
        {...dateRangePickerProps}
      />
      <SearchBar {...searchBarProps} />
    </>
  );
}

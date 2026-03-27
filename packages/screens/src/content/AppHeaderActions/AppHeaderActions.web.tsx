'use client';

import { useMemo, useState } from 'react';
import { Header, DateRangePicker, SearchBar } from '@automatize/ui/web';
import type { DateRange } from '@automatize/ui/web';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { AppHeaderActionsProps } from './AppHeaderActions.types';

export type { AppHeaderActionsProps } from './AppHeaderActions.types';

export function AppHeaderActions({
  locale,
  dateRangePickerProps,
  searchBarProps,
  ...headerProps
}: AppHeaderActionsProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const dateFnsLocale = useMemo(
    () => (locale.code === 'pt-BR' ? ptBR : undefined),
    [locale.code]
  );

  return (
    <Header
      {...headerProps}
      actions={
        <>
          <DateRangePicker
            selected={dateRange}
            onApply={setDateRange}
            locale={dateFnsLocale}
            {...dateRangePickerProps}
          />
          <SearchBar {...searchBarProps} />
        </>
      }
    />
  );
}

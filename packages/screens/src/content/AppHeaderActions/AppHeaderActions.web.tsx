'use client';

import { useMemo, useState } from 'react';
import { Header, DateRangePicker, SearchBar } from '@automatize/ui/web';
import type { DateRange, HeaderProps } from '@automatize/ui/web';
import type { TFunction, LanguageOption } from '@automatize/core-localization';
import { ptBR } from 'date-fns/locale/pt-BR';

export interface AppHeaderActionsProps extends Omit<HeaderProps, 'actions'> {
  /** Translation function from useTranslation(). */
  t: TFunction;
  /** Current locale option. */
  locale: LanguageOption;
}

export function AppHeaderActions({
  t,
  locale,
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
      }
    />
  );
}

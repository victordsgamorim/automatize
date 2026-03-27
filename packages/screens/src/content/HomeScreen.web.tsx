'use client';

import { useMemo, useState } from 'react';
import type { SidebarNavItem } from '@automatize/ui/web';
import {
  SidebarProvider,
  SidebarLayout,
  Header,
  DateRangePicker,
  SearchBar,
} from '@automatize/ui/web';
import type { DateRange } from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { HomeScreenProps } from './HomeScreen.types';

export function HomeScreen({
  items,
  activeTile,
  onNavigate,
  header,
  profile,
  profileMenuItems,
  pageHeaderProps,
  children,
}: HomeScreenProps) {
  const activeIndex = items.findIndex((item) => item.id === activeTile);
  const { t, language } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const dateFnsLocale = useMemo(
    () => (language === 'pt-BR' ? ptBR : undefined),
    [language]
  );

  const navItems: SidebarNavItem[] = useMemo(
    () =>
      items.map((item) => ({
        icon: item.icon,
        label: item.label,
        group: item.group,
        onTap: () => onNavigate(item.id, item.route),
      })),
    [items, onNavigate]
  );

  return (
    <SidebarProvider>
      <SidebarLayout
        header={header}
        items={navItems}
        activeIndex={activeIndex >= 0 ? activeIndex : 0}
        profile={profile}
        profileMenuItems={profileMenuItems}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {pageHeaderProps && (
          <Header
            {...pageHeaderProps}
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
        )}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            transition: 'width 300ms ease-in-out',
          }}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

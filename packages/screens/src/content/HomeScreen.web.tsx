'use client';

import { useMemo } from 'react';
import type { SidebarNavItem } from '@automatize/ui/web';
import { SidebarProvider, SidebarLayout, Header } from '@automatize/ui/web';
import type { HomeScreenProps } from './HomeScreen.types';
import { AppHeaderActions } from './AppHeaderActions/AppHeaderActions.web';

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
            title={pageHeaderProps.title}
            className={pageHeaderProps.className}
            actions={
              <AppHeaderActions
                locale={pageHeaderProps.locale}
                dateRangePickerProps={pageHeaderProps.dateRangePickerProps}
                searchBarProps={pageHeaderProps.searchBarProps}
              />
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

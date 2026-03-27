'use client';

import { useMemo } from 'react';
import type { SidebarNavItem } from '@automatize/ui/web';
import {
  SidebarProvider,
  SidebarLayout,
  Header,
  BottomNavigation,
  useSidebar,
} from '@automatize/ui/web';
import type { HomeScreenProps } from './HomeScreen.types';
import { AppHeaderActions } from './AppHeaderActions/AppHeaderActions.web';

function HomeScreenContent({
  items,
  activeTile,
  onNavigate,
  header,
  profile,
  profileMenuItems,
  pageHeaderProps,
  children,
}: HomeScreenProps) {
  const { isMobile } = useSidebar();
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

  const resolvedIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <>
      {!isMobile && (
        <SidebarLayout
          header={header}
          items={navItems}
          activeIndex={resolvedIndex}
          profile={profile}
          profileMenuItems={profileMenuItems}
        />
      )}
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
        {isMobile && (
          <BottomNavigation items={navItems} activeIndex={resolvedIndex} />
        )}
      </div>
    </>
  );
}

export function HomeScreen(props: HomeScreenProps) {
  return (
    <SidebarProvider>
      <HomeScreenContent {...props} />
    </SidebarProvider>
  );
}

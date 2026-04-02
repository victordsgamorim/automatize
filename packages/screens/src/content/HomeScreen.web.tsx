'use client';

import {
  SidebarProvider,
  SidebarLayout,
  Header,
  BottomNavigation,
  useSidebar,
} from '@automatize/ui/web';
import { SidebarLogo } from './SidebarLogo/SidebarLogo.web';
import type { HomeScreenProps } from './HomeScreen.types';
import { AppHeaderActions } from './AppHeaderActions/AppHeaderActions.web';

function HomeScreenContent({
  navProps,
  pageHeaderProps,
  children,
}: HomeScreenProps) {
  const { isMobile } = useSidebar();

  return (
    <>
      {!isMobile && (
        <SidebarLayout
          header={<SidebarLogo />}
          items={navProps.items}
          activeIndex={navProps.activeIndex}
          profile={navProps.profile}
          profileMenuItems={navProps.profileMenuItems}
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
                profile={isMobile ? navProps.profile : undefined}
                profileMenuItems={
                  isMobile ? navProps.profileMenuItems : undefined
                }
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
          <BottomNavigation
            items={navProps.items}
            activeIndex={navProps.activeIndex}
          />
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

'use client';

import {
  SidebarProvider,
  SidebarLayout,
  SidebarLogo,
  Header,
  BottomNavigation,
  useSidebar,
} from '@automatize/ui/web';
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

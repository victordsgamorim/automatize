'use client';

import React from 'react';
import {
  SidebarProvider,
  SidebarLayout,
  Header,
  BottomNavigation,
  useSidebar,
} from '@automatize/ui/web';
import { SidebarLogo } from './components/SidebarLogo/SidebarLogo.web';
import type { HomeScreenProps } from './HomeScreen.types';
import { AppHeaderActions } from './components/AppHeaderActions/AppHeaderActions.web';
import { ProfileProvider, useProfile } from '../profile/ProfileProvider';
import type { ProfileData } from '../profile/ProfileProvider';

const EMPTY_PROFILE: ProfileData = {
  name: '',
  email: '',
  companyName: '',
  phones: [],
};

function HomeScreenContent({
  navProps,
  pageHeaderProps,
  children,
}: Omit<HomeScreenProps, 'initialProfileData'>) {
  const { isMobile } = useSidebar();
  const { profile } = useProfile();

  const sidebarProfile = navProps.profile
    ? { ...navProps.profile, label: profile.name, subtitle: profile.email }
    : navProps.profile;

  return (
    <>
      {!isMobile && (
        <SidebarLayout
          header={<SidebarLogo />}
          items={navProps.items}
          activeIndex={navProps.activeIndex}
          profile={sidebarProfile}
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
                profile={isMobile ? sidebarProfile : undefined}
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

export function HomeScreen({
  initialProfileData,
  ...props
}: HomeScreenProps): React.JSX.Element {
  const providerData: ProfileData = initialProfileData ?? EMPTY_PROFILE;

  return (
    <SidebarProvider>
      <ProfileProvider initialData={providerData}>
        <HomeScreenContent {...props} />
      </ProfileProvider>
    </SidebarProvider>
  );
}

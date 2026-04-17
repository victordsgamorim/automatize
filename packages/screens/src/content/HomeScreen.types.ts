import type { SidebarProps, HeaderProps } from '@automatize/ui/web';
import type { AppHeaderActionsProps } from './components/AppHeaderActions/AppHeaderActions.types';
import type { ProfileData } from '../profile/ProfileProvider';

export type {
  SidebarProps,
  SidebarProfileConfig,
  SidebarProfileMenuItem,
} from '@automatize/ui/web';

export type { AppHeaderActionsProps } from './components/AppHeaderActions/AppHeaderActions.types';

/** A single navigation item passed to HomeScreen. */
export interface HomeScreenItem {
  /** Unique identifier for this tile. */
  id: string;
  /** Icon element to display. */
  icon: React.ReactNode;
  /** Display label. */
  label: string;
  /** Route path to navigate to when clicked. */
  route: string;
  /** Optional group label for sidebar grouping. */
  group?: string;
}

export interface HomeScreenProps {
  /** Navigation configuration. */
  navProps: SidebarProps;
  /** Props for the top page header bar + actions (locale, dateRangePickerProps, searchBarProps). */
  pageHeaderProps?: HeaderProps & AppHeaderActionsProps;
  /** Main content area. */
  children: React.ReactNode;
  /**
   * Initial profile data for the sidebar profile tile and ProfileScreen.
   * When provided, the sidebar label/subtitle become reactive to profile updates.
   */
  initialProfileData?: ProfileData;
}

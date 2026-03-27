import type { SidebarProps, HeaderProps } from '@automatize/ui/web';
import type { AppHeaderActionsProps } from './AppHeaderActions/AppHeaderActions.types';

export type {
  SidebarProps,
  SidebarProfileConfig,
  SidebarProfileMenuItem,
} from '@automatize/ui/web';

export type { AppHeaderActionsProps } from './AppHeaderActions/AppHeaderActions.types';

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
}

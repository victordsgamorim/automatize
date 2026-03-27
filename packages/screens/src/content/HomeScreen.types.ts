import type {
  SidebarProfileConfig,
  SidebarProfileMenuItem,
  HeaderProps,
} from '@automatize/ui/web';
import type { AppHeaderActionsProps } from './AppHeaderActions/AppHeaderActions.types';

export type {
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
  /** Ordered list of navigation items (tiles). */
  items: HomeScreenItem[];
  /** The currently active tile id. */
  activeTile: string;
  /** Called when a tile is clicked. Receives the item id and its route path. */
  onNavigate: (id: string, route: string) => void;
  /** Header slot — typically a logo or brand element. */
  header: React.ReactNode;
  /** Profile configuration for the sidebar footer. */
  profile?: SidebarProfileConfig;
  /** Profile dropdown menu items (Settings, Log out, etc.). */
  profileMenuItems?: SidebarProfileMenuItem[];
  /** Props for the top page header bar + actions (locale, dateRangePickerProps, searchBarProps). */
  pageHeaderProps?: HeaderProps & AppHeaderActionsProps;
  /** Main content area. */
  children: React.ReactNode;
}

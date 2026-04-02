import type {
  DateRangePickerProps,
  SearchBarProps,
  SidebarProfileConfig,
  SidebarProfileMenuItem,
} from '@automatize/ui/web';
import type { LanguageOption } from '@automatize/core-localization';

export interface AppHeaderActionsProps {
  /** Current locale option — used to resolve the date-fns locale. */
  locale: LanguageOption;
  /** Translated props for the DateRangePicker. */
  dateRangePickerProps: DateRangePickerProps;
  /** Translated props for the SearchBar. */
  searchBarProps: SearchBarProps;
  /** Profile config — shown in header on mobile (since sidebar is hidden). */
  profile?: SidebarProfileConfig;
  /** Menu items for the profile dropdown. */
  profileMenuItems?: SidebarProfileMenuItem[];
}

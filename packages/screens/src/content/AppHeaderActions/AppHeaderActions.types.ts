import type { DateRangePickerProps, SearchBarProps } from '@automatize/ui/web';
import type { LanguageOption } from '@automatize/core-localization';

export interface AppHeaderActionsProps {
  /** Current locale option — used to resolve the date-fns locale. */
  locale: LanguageOption;
  /** Translated props for the DateRangePicker. */
  dateRangePickerProps: DateRangePickerProps;
  /** Translated props for the SearchBar. */
  searchBarProps: SearchBarProps;
}

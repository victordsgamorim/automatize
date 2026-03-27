import type { DateRangePickerProps, SearchBarProps } from '@automatize/ui/web';
import type { LanguageOption } from '@automatize/core-localization';

/** Props for the DateRangePicker forwarded through AppHeaderActions. */
export interface AppHeaderDateRangePickerProps extends Pick<
  DateRangePickerProps,
  'placeholder' | 'clearLabel' | 'applyLabel'
> {}

/** Props for the SearchBar forwarded through AppHeaderActions. */
export interface AppHeaderSearchBarProps extends Pick<
  SearchBarProps,
  'placeholder' | 'emptyMessage'
> {}

export interface AppHeaderActionsProps {
  /** Current locale option — used to resolve the date-fns locale. */
  locale: LanguageOption;
  /** Translated props for the DateRangePicker. */
  dateRangePickerProps: AppHeaderDateRangePickerProps;
  /** Translated props for the SearchBar. */
  searchBarProps: AppHeaderSearchBarProps;
}

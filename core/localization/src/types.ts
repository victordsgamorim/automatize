/** A single selectable language option */
export interface LanguageOption {
  code: string;
  label: string;
  ext?: string;
}

/** Locale data passed from the app layer to UI components */
export interface LocaleData {
  /** All selectable language options */
  languages: LanguageOption[];
  /** Currently active language code */
  currentLanguage: string;
  /** Called when the user selects a language */
  onLanguageChange: (code: string) => void;
}

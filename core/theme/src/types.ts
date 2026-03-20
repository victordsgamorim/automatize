/** A single selectable theme option */
export interface ThemeOption {
  value: 'light' | 'dark' | 'system';
  label: string;
}

/** Theme data passed from the app layer to UI components */
export interface ThemeData {
  /** User's current theme preference */
  currentTheme: 'light' | 'dark' | 'system';
  /** Whether the resolved theme is dark */
  isDarkTheme: boolean;
  /** All selectable theme options */
  themeOptions: ThemeOption[];
  /** Called when the user selects a theme */
  onThemeChange: (preference: 'light' | 'dark' | 'system') => void;
}

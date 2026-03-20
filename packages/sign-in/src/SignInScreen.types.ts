export interface LanguageOption {
  code: string;
  label: string;
  ext?: string;
}

export interface ThemeOption {
  value: 'light' | 'dark' | 'system';
  label: string;
}

export interface LocaleData {
  languages: LanguageOption[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
}

export interface ThemeData {
  currentTheme: 'light' | 'dark' | 'system';
  isDarkTheme: boolean;
  themeOptions: ThemeOption[];
  onThemeChange: (preference: 'light' | 'dark' | 'system') => void;
}

export interface SignInScreenProps {
  /** Called after a successful sign-in */
  onSuccess: () => void;
  /** Called when user taps "Reset password" */
  onResetPassword: () => void;
  /** Language switcher data */
  locale: LocaleData;
  /** Theme switcher data (web only — ignored on native) */
  theme?: ThemeData;
}

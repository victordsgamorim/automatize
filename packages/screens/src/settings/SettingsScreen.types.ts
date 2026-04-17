import type { LocaleData } from '@automatize/core-localization';
import type { ThemeData } from '@automatize/core-theme';

export type { LanguageOption, LocaleData } from '@automatize/core-localization';
export type { ThemeData, ThemeOption } from '@automatize/core-theme';

export interface SettingsLabels {
  title: string;
  subtitle: string;
  appearanceTitle: string;
  appearanceDescription: string;
  themeLabel: string;
  languageTitle: string;
  languageDescription: string;
  languageLabel: string;
  aboutTitle: string;
  versionLabel: string;
}

export interface SettingsScreenProps {
  /** All translated UI strings */
  labels: SettingsLabels;
  /** Language switcher data */
  locale: LocaleData;
  /** Theme switcher data (web only — ignored on native) */
  theme?: ThemeData;
  /** App version string displayed in the About section */
  appVersion: string;
}

export interface SettingsDialogProps extends SettingsScreenProps {
  /** Whether the dialog is currently open */
  isOpen: boolean;
  /** Called when the dialog requests to close */
  onClose: () => void;
}

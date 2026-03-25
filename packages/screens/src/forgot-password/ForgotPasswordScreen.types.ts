import type { LocaleData } from '@automatize/core-localization';
import type { ThemeData } from '@automatize/core-theme';

export type { LanguageOption, LocaleData } from '@automatize/core-localization';
export type { ThemeData, ThemeOption } from '@automatize/core-theme';

export interface ForgotPasswordScreenProps {
  /** Called when user wants to navigate back to sign-in */
  onBackToSignIn: () => void;
  /** Language switcher data */
  locale: LocaleData;
  /** Theme switcher data (web only — ignored on native) */
  theme?: ThemeData;
}

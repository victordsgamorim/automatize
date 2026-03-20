export { LocalizationProvider } from './LocalizationProvider';
export type { LocalizationProviderProps } from './LocalizationProvider';
export { createLocalLoader } from './loaders/LocalLoader';
export { initLocalization, _resetLocalization } from './singleton';
export { useTranslation } from 'react-i18next';
export { SUPPORTED_LANGUAGES } from './loaders/types';
export type {
  TranslationLoader,
  SupportedLanguage,
  SupportedNamespace,
} from './loaders/types';

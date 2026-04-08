import type {
  TranslationLoader,
  SupportedLanguage,
  SupportedNamespace,
} from './types';

import enCommon from '../locales/en/common.json';
import ptBRCommon from '../locales/pt-BR/common.json';

const LOCALES: Record<
  SupportedLanguage,
  Record<SupportedNamespace, Record<string, string>>
> = {
  en: {
    common: enCommon,
  },
  'pt-BR': {
    common: ptBRCommon,
  },
};

export function createLocalLoader(): TranslationLoader {
  return {
    resources: LOCALES,
    load: (
      language: SupportedLanguage,
      namespace: SupportedNamespace
    ): Promise<Record<string, string>> => {
      return Promise.resolve(LOCALES[language]?.[namespace] ?? {});
    },
  };
}

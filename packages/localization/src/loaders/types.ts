export type SupportedLanguage = 'en' | 'pt-BR';

export type SupportedNamespace = 'common';

export interface TranslationLoader {
  load(
    language: SupportedLanguage,
    namespace: SupportedNamespace
  ): Promise<Record<string, string>>;
}

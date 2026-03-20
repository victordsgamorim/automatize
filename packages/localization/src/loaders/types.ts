export type SupportedLanguage = 'en' | 'pt-BR';

export type SupportedNamespace = 'common';

export interface TranslationLoader {
  load(
    language: SupportedLanguage,
    namespace: SupportedNamespace
  ): Promise<Record<string, string>>;

  /**
   * Optional pre-loaded resources keyed by language → namespace → key → value.
   * When provided, initLocalization uses them directly in i18next.init(),
   * making initialization synchronous (no async backend round-trip).
   * This is critical for SSR to avoid hydration mismatches.
   */
  resources?: Record<string, Record<string, Record<string, string>>>;
}

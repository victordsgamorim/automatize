import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import { LocalizationProvider } from '../src/LocalizationProvider';
import { initLocalization, _resetLocalization } from '../src/singleton';
import { createLocalLoader } from '../src/loaders/LocalLoader';

function LanguageDisplay() {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <span data-testid="lang">{i18n.language}</span>
      <span data-testid="save">{t('app.save')}</span>
      <span data-testid="lang-name">{t('app.language.en')}</span>
      <span data-testid="lang-ext">{t('app.language.en.ext')}</span>
      <span data-testid="lang-pt-name">{t('app.language.pt-BR')}</span>
      <span data-testid="lang-pt-ext">{t('app.language.pt-BR.ext')}</span>
    </div>
  );
}

beforeEach(() => _resetLocalization());
afterEach(() => _resetLocalization());

describe('changeLanguage', () => {
  describe('initial render', () => {
    it('resolves app.language.en and app.language.en.ext in en locale', async () => {
      initLocalization(createLocalLoader(), 'en');
      render(
        <LocalizationProvider>
          <LanguageDisplay />
        </LocalizationProvider>
      );
      await waitFor(() => screen.getByTestId('lang-name'));
      expect(screen.getByTestId('lang-name').textContent).toBe('English');
      expect(screen.getByTestId('lang-ext').textContent).toBe('US');
    });

    it('resolves app.language.pt-BR and app.language.pt-BR.ext in en locale', async () => {
      initLocalization(createLocalLoader(), 'en');
      render(
        <LocalizationProvider>
          <LanguageDisplay />
        </LocalizationProvider>
      );
      await waitFor(() => screen.getByTestId('lang-pt-name'));
      expect(screen.getByTestId('lang-pt-name').textContent).toBe('Portuguese');
      expect(screen.getByTestId('lang-pt-ext').textContent).toBe('BR');
    });

    it('resolves app.language.en in pt-BR locale', async () => {
      initLocalization(createLocalLoader(), 'pt-BR');
      render(
        <LocalizationProvider>
          <LanguageDisplay />
        </LocalizationProvider>
      );
      await waitFor(() => screen.getByTestId('lang-name'));
      expect(screen.getByTestId('lang-name').textContent).toBe('Inglês');
    });

    it('resolves app.language.pt-BR in pt-BR locale', async () => {
      initLocalization(createLocalLoader(), 'pt-BR');
      render(
        <LocalizationProvider>
          <LanguageDisplay />
        </LocalizationProvider>
      );
      await waitFor(() => screen.getByTestId('lang-pt-name'));
      expect(screen.getByTestId('lang-pt-name').textContent).toBe('Português');
    });

    it('ext values are locale-independent (always US and BR)', async () => {
      initLocalization(createLocalLoader(), 'pt-BR');
      render(
        <LocalizationProvider>
          <LanguageDisplay />
        </LocalizationProvider>
      );
      await waitFor(() => screen.getByTestId('lang-ext'));
      expect(screen.getByTestId('lang-ext').textContent).toBe('US');
      expect(screen.getByTestId('lang-pt-ext').textContent).toBe('BR');
    });
  });

  describe('switching language', () => {
    it('updates translations after switching from en to pt-BR', async () => {
      initLocalization(createLocalLoader(), 'en');
      render(
        <LocalizationProvider>
          <LanguageDisplay />
        </LocalizationProvider>
      );

      await waitFor(() =>
        expect(screen.getByTestId('save').textContent).toBe('Save')
      );

      const instance = await import('../src/singleton').then((m) =>
        m.getLocalizationInstanceAsync()
      );
      await act(() => instance.changeLanguage('pt-BR'));

      await waitFor(() =>
        expect(screen.getByTestId('save').textContent).toBe('Salvar')
      );
      expect(screen.getByTestId('lang').textContent).toBe('pt-BR');
    });

    it('updates translations after switching from pt-BR back to en', async () => {
      initLocalization(createLocalLoader(), 'pt-BR');
      render(
        <LocalizationProvider>
          <LanguageDisplay />
        </LocalizationProvider>
      );

      await waitFor(() =>
        expect(screen.getByTestId('save').textContent).toBe('Salvar')
      );

      const instance = await import('../src/singleton').then((m) =>
        m.getLocalizationInstanceAsync()
      );
      await act(() => instance.changeLanguage('en'));

      await waitFor(() =>
        expect(screen.getByTestId('save').textContent).toBe('Save')
      );
      expect(screen.getByTestId('lang').textContent).toBe('en');
    });

    it('language name keys update correctly after switch', async () => {
      initLocalization(createLocalLoader(), 'en');
      render(
        <LocalizationProvider>
          <LanguageDisplay />
        </LocalizationProvider>
      );

      await waitFor(() =>
        expect(screen.getByTestId('lang-name').textContent).toBe('English')
      );

      const instance = await import('../src/singleton').then((m) =>
        m.getLocalizationInstanceAsync()
      );
      await act(() => instance.changeLanguage('pt-BR'));

      await waitFor(() =>
        expect(screen.getByTestId('lang-name').textContent).toBe('Inglês')
      );
    });
  });
});

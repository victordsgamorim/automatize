import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import { LocalizationProvider } from '../src/LocalizationProvider';
import { createLocalLoader } from '../src/loaders/LocalLoader';
import type { TranslationLoader } from '../src/loaders/types';

function TranslatedTitle() {
  const { t } = useTranslation();
  return <span>{t('app.title')}</span>;
}

function TranslatedSave() {
  const { t } = useTranslation();
  return <span>{t('app.save')}</span>;
}

describe('LocalizationProvider', () => {
  it('renders children after i18next initialization', async () => {
    render(
      <LocalizationProvider loader={createLocalLoader()}>
        <div>Hello world</div>
      </LocalizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeTruthy();
    });
  });

  it('provides en translations by default', async () => {
    render(
      <LocalizationProvider loader={createLocalLoader()}>
        <TranslatedTitle />
      </LocalizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Automatize')).toBeTruthy();
    });
  });

  it('provides en translations when defaultLanguage="en"', async () => {
    render(
      <LocalizationProvider loader={createLocalLoader()} defaultLanguage="en">
        <TranslatedSave />
      </LocalizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeTruthy();
    });
  });

  it('provides pt-BR translations when defaultLanguage="pt-BR"', async () => {
    render(
      <LocalizationProvider
        loader={createLocalLoader()}
        defaultLanguage="pt-BR"
      >
        <TranslatedSave />
      </LocalizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Salvar')).toBeTruthy();
    });
  });

  it('renders children even when loader throws (graceful fallback)', async () => {
    const failingLoader: TranslationLoader = {
      load: vi.fn().mockRejectedValue(new Error('network error')),
    };

    render(
      <LocalizationProvider loader={failingLoader}>
        <div>Fallback content</div>
      </LocalizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Fallback content')).toBeTruthy();
    });
  });

  it('renders null before initialization (no flash of untranslated content)', () => {
    const { container } = render(
      <LocalizationProvider loader={createLocalLoader()}>
        <div>Content</div>
      </LocalizationProvider>
    );

    // On the initial synchronous render, provider returns null
    expect(container.firstChild).toBeNull();
  });
});

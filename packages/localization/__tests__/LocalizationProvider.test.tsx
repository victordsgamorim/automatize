import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import { LocalizationProvider } from '../src/LocalizationProvider';
import { initLocalization, _resetLocalization } from '../src/singleton';
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

// Each test gets a clean singleton so they don't bleed into each other.
beforeEach(() => _resetLocalization());
afterEach(() => _resetLocalization());

describe('LocalizationProvider', () => {
  it('renders children after i18next initialization', async () => {
    initLocalization(createLocalLoader());
    render(
      <LocalizationProvider>
        <div>Hello world</div>
      </LocalizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeTruthy();
    });
  });

  it('provides en translations by default', async () => {
    initLocalization(createLocalLoader());
    render(
      <LocalizationProvider>
        <TranslatedTitle />
      </LocalizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Automatize')).toBeTruthy();
    });
  });

  it('provides en translations when initLocalization is called with "en"', async () => {
    initLocalization(createLocalLoader(), 'en');
    render(
      <LocalizationProvider>
        <TranslatedSave />
      </LocalizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeTruthy();
    });
  });

  it('provides pt-BR translations when initLocalization is called with "pt-BR"', async () => {
    initLocalization(createLocalLoader(), 'pt-BR');
    render(
      <LocalizationProvider>
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

    initLocalization(failingLoader);
    render(
      <LocalizationProvider>
        <div>Fallback content</div>
      </LocalizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Fallback content')).toBeTruthy();
    });
  });

  it('calling initLocalization more than once has no effect (singleton)', async () => {
    const loader1 = createLocalLoader();
    const loader2 = { load: vi.fn().mockResolvedValue({}) };

    initLocalization(loader1, 'en');
    initLocalization(loader2 as TranslationLoader, 'pt-BR'); // second call ignored

    render(
      <LocalizationProvider>
        <TranslatedSave />
      </LocalizationProvider>
    );

    // loader2.load should never be called — singleton was already started
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeTruthy(); // en, from loader1
    });
    expect(loader2.load).not.toHaveBeenCalled();
  });

  it('renders null before initialization (no flash of untranslated content)', () => {
    initLocalization(createLocalLoader());
    const { container } = render(
      <LocalizationProvider>
        <div>Content</div>
      </LocalizationProvider>
    );

    // Synchronous render: i18next init is async so instance is not yet ready
    expect(container.firstChild).toBeNull();
  });

  it('skips the async wait and renders immediately when instance is already ready', async () => {
    initLocalization(createLocalLoader());

    // Wait for init to complete before mounting
    await new Promise<void>((resolve) => setTimeout(resolve, 200));

    const { container } = render(
      <LocalizationProvider>
        <div>Instant content</div>
      </LocalizationProvider>
    );

    // Instance was already set — first render should produce content, not null
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByText('Instant content')).toBeTruthy();
  });
});

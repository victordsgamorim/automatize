'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useNavigation } from '@automatize/navigation';
import { useTranslation, SUPPORTED_LANGUAGES } from '@automatize/localization';
import { useTheme, THEME_PREFERENCES } from '@automatize/theme';
import { ClientFormScreen } from '@automatize/screens/client-form/web';
import type { ClientFormData } from '@automatize/screens/client-form/web';

const STORAGE_KEY = 'automatize:client-form-draft';

function loadDraft(): ClientFormData | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ClientFormData;
  } catch {
    /* corrupted data — ignore */
  }
  return undefined;
}

function clearDraft() {
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Returns true if the page was loaded via a browser refresh (F5) */
function isPageReload(): boolean {
  if (typeof performance === 'undefined') return false;
  const navEntries = performance.getEntriesByType(
    'navigation'
  ) as PerformanceNavigationTiming[];
  return navEntries.length > 0 && navEntries[0].type === 'reload';
}

export default function NewClientPage(): React.JSX.Element {
  const { navigate } = useNavigation();
  const { i18n, t } = useTranslation();
  const { preference, isDark, setTheme } = useTheme();

  // Restore draft only on SPA navigation; clear on page refresh
  const [initialData] = useState(() => {
    if (isPageReload()) {
      clearDraft();
      return undefined;
    }
    return loadDraft();
  });

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  useEffect(() => {
    if (!initialData && !sessionStorage.getItem(STORAGE_KEY)) return;

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setShowDiscardDialog(true);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDataChange = useCallback((data: ClientFormData) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const handleSubmit = (data: ClientFormData) => {
    // eslint-disable-next-line no-console
    console.warn('New client data:', data);
    clearDraft();
    navigate('/clients');
  };

  const handleBack = () => {
    navigate('/clients');
  };

  const handleDiscardCancel = () => {
    setShowDiscardDialog(false);
    window.history.pushState(null, '', window.location.href);
  };

  return (
    <ClientFormScreen
      onSubmit={handleSubmit}
      initialData={initialData}
      onDataChange={handleDataChange}
      onBack={handleBack}
      showDiscardDialog={showDiscardDialog}
      onDiscardCancel={handleDiscardCancel}
      locale={{
        languages: SUPPORTED_LANGUAGES.map((lang) => ({
          code: lang,
          label: t(`app.language.${lang}`),
          ext: t(`app.language.${lang}.ext`),
        })),
        currentLanguage: i18n.language,
        onLanguageChange: (code) => void i18n.changeLanguage(code),
      }}
      theme={{
        currentTheme: preference,
        isDarkTheme: isDark,
        themeOptions: THEME_PREFERENCES.map((pref) => ({
          value: pref,
          label: t(`theme.${pref}`),
        })),
        onThemeChange: setTheme,
      }}
    />
  );
}

'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useNavigation } from '@automatize/navigation';
import { useTranslation, SUPPORTED_LANGUAGES } from '@automatize/localization';
import { useTheme, THEME_PREFERENCES } from '@automatize/theme';
import { ClientFormScreen } from '@automatize/screens/client-form/web';
import type { ClientFormData } from '@automatize/screens/client-form/web';
import type { ClientRow } from '@automatize/screens/client/web';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  PrimaryButton,
  SecondaryButton,
  Kbd,
} from '@automatize/ui/web';
import {
  getClientIdToEdit,
  getClientFormData,
  updateSavedClient,
  clearClientToEdit,
} from '../clientStore';

/**
 * Module-level draft store. Survives SPA navigations;
 * cleared on page refresh (same pattern as new/page.tsx).
 */
let formDraft: ClientFormData | undefined;

function toClientRow(data: ClientFormData, id: string): ClientRow {
  return {
    id,
    name: data.name,
    clientType: data.clientType,
    document: data.document,
    addresses: data.addresses.map((a) => ({
      id: a.id,
      addressType: a.addressType,
      street: a.street,
      number: a.number,
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
      info: a.info,
    })),
    phones: data.phones.map((p) => ({
      id: p.id,
      phoneType: p.phoneType,
      number: p.number,
    })),
  };
}

export default function EditClientPage(): React.JSX.Element {
  const { navigate } = useNavigation();
  const { i18n, t } = useTranslation();
  const { preference, isDark, setTheme } = useTheme();

  // Resolve which client we're editing; fall back to module-level draft on
  // SPA back-navigation (clientIdToEdit cleared on confirm, draft persists).
  const clientId = getClientIdToEdit();
  const [initialData] = useState<ClientFormData | undefined>(() => {
    if (clientId) return getClientFormData(clientId);
    return formDraft;
  });

  const [pendingData, setPendingData] = useState<ClientFormData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Guard browser back button when a draft exists
  useEffect(() => {
    if (!initialData && !formDraft) return;

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
    formDraft = data;
  }, []);

  // Intercept submit — show confirm dialog instead of saving immediately
  const handleSubmit = (data: ClientFormData) => {
    setPendingData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirm = useCallback(() => {
    if (!clientId || !pendingData) return;
    updateSavedClient(
      clientId,
      toClientRow(pendingData, clientId),
      pendingData
    );
    clearClientToEdit();
    formDraft = undefined;
    navigate('/clients');
  }, [clientId, pendingData, navigate]);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingData(null);
  }, []);

  const handleBack = () => {
    formDraft = undefined;
    clearClientToEdit();
    navigate('/clients');
  };

  const handleDiscardCancel = () => {
    setShowDiscardDialog(false);
    window.history.pushState(null, '', window.location.href);
  };

  // Keyboard shortcuts for the confirm-edit dialog
  useEffect(() => {
    if (!showConfirmDialog) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelConfirm();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showConfirmDialog, handleConfirm, handleCancelConfirm]);

  return (
    <>
      <ClientFormScreen
        mode="edit"
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

      {/* Confirm edit dialog */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          if (!open) handleCancelConfirm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('client.edit.confirm.title')}</DialogTitle>
            <DialogDescription>
              {t('client.edit.confirm.description', {
                name: pendingData?.name ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton type="button" onClick={handleCancelConfirm}>
              {t('client.discard.cancel')}
              <Kbd keyLabel="Esc" />
            </SecondaryButton>
            <PrimaryButton type="button" onClick={handleConfirm}>
              {t('client.discard.continue')}
              <Kbd keyLabel="Enter" />
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
import { getMockClientById } from '../data/mock-clients';
import type { Client } from '../data/types';

let formDraft: ClientFormData | undefined;

function clientToFormData(client: Client): ClientFormData {
  return {
    clientType: client.clientType,
    name: client.name,
    document: client.document,
    addresses: client.addresses.map((a) => ({
      id: a.id,
      addressType: a.addressType,
      street: a.street,
      number: a.number,
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
      info: a.info,
    })),
    phones: client.phones.map((p) => ({
      id: p.id,
      phoneType: p.phoneType,
      number: p.number,
    })),
  };
}

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

  const clientId = getClientIdToEdit();
  const [initialData] = useState<ClientFormData | undefined>(() => {
    if (clientId) {
      const fromStore = getClientFormData(clientId);
      if (fromStore) return fromStore;
      const fromMock = getMockClientById(clientId);
      if (fromMock) return clientToFormData(fromMock);
    }
    return formDraft;
  });

  const [pendingData, setPendingData] = useState<ClientFormData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

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

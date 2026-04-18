import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
  Card,
  Kbd,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DestructiveKbd,
  useToasts,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { useResponsive } from '@automatize/ui/responsive';
import type { ClientFormScreenProps } from './ClientFormScreen.types';
import { useClientForm } from './useClientForm';
import { AddressSection } from './components/AddressSection/AddressSection.web';
import { PhoneSection } from './components/PhoneSection/PhoneSection.web';
import { PersonalDetailsSection } from './components/PersonalDetailsSection/PersonalDetailsSection.web';

export const ClientFormScreen: React.FC<ClientFormScreenProps> = ({
  mode = 'create',
  onSubmit,
  initialData,
  onDataChange,
  onBack,
  showDiscardDialog,
  onDiscardCancel,
}) => {
  const isEdit = mode === 'edit';
  const titleKey = isEdit ? 'client.form.title.edit' : 'client.form.title';
  const descriptionKey = isEdit
    ? 'client.form.description.edit'
    : 'client.form.description';
  const submitKey = isEdit ? 'client.submit.edit' : 'client.submit';
  const { t } = useTranslation();
  const toast = useToasts();
  const {
    clientType,
    setClientType,
    name,
    setName,
    document,
    setDocument,
    addresses,
    addAddress,
    removeAddress,
    insertAddressAt,
    updateAddress,
    phones,
    addPhone,
    removePhone,
    insertPhoneAt,
    updatePhone,
    getFormData,
    resetForm,
  } = useClientForm({ initialData, onDataChange });

  const handleRemoveAddress = useCallback(
    (id: string) => {
      const index = addresses.findIndex((a) => a.id === id);
      if (index === -1) return;
      const removed = addresses[index];
      removeAddress(id);
      toast.message({
        text: t('client.address.removed'),
        onUndoAction: () => insertAddressAt(index, removed),
      });
    },
    [addresses, removeAddress, insertAddressAt, toast, t]
  );

  const handleRemovePhone = useCallback(
    (id: string) => {
      const index = phones.findIndex((p) => p.id === id);
      if (index === -1) return;
      const removed = phones[index];
      removePhone(id);
      toast.message({
        text: t('client.phone.removed'),
        onUndoAction: () => insertPhoneAt(index, removed),
      });
    },
    [phones, removePhone, insertPhoneAt, toast, t]
  );

  const [internalDialogOpen, setInternalDialogOpen] = useState(false);

  const isControlled = showDiscardDialog !== undefined;
  const dialogOpen = isControlled ? showDiscardDialog : internalDialogOpen;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(getFormData());
  };

  const hasFormData =
    name.trim() !== '' ||
    document.trim() !== '' ||
    addresses.some(
      (a) =>
        a.street.trim() !== '' ||
        a.number.trim() !== '' ||
        a.neighborhood.trim() !== '' ||
        a.city.trim() !== '' ||
        a.state.trim() !== '' ||
        a.info.trim() !== ''
    ) ||
    phones.some((p) => p.number.trim() !== '');

  const handleSaveWithShortcut = useCallback(() => {
    if (name.trim() || document.trim()) {
      onSubmit(getFormData());
    }
  }, [name, document, getFormData, onSubmit]);

  const handleClearWithShortcut = useCallback(() => {
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (!hasFormData) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasFormData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (isMod && !isShift && e.key === 's') {
        e.preventDefault();
        handleSaveWithShortcut();
      } else if (isMod && e.key === 'e') {
        e.preventDefault();
        handleClearWithShortcut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveWithShortcut, handleClearWithShortcut]);

  const handleConfirmDiscard = () => {
    if (isControlled) {
      onBack?.();
    } else {
      setInternalDialogOpen(false);
      onBack?.();
    }
  };

  const handleCancelDiscard = () => {
    if (isControlled) {
      onDiscardCancel?.();
    } else {
      setInternalDialogOpen(false);
      onDiscardCancel?.();
    }
  };

  const handleCancel = useCallback(() => {
    resetForm();
    onBack?.();
  }, [resetForm, onBack]);

  const { isMobile } = useResponsive();

  const formRef = useRef<HTMLFormElement>(null);

  const handleSave = useCallback(() => {
    if (name.trim() === '') return;
    onSubmit(getFormData());
  }, [name, onSubmit, getFormData]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSave();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        resetForm();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, handleCancel, resetForm]);

  return (
    <>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t(titleKey)}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t(descriptionKey)}
              </p>
            </div>
            <div className="flex justify-end">
              <DestructiveButton
                type="button"
                onClick={resetForm}
                size={isMobile ? 'sm' : 'default'}
                className="w-full sm:w-auto h-10"
              >
                {t('client.reset')}
                {!isMobile && <DestructiveKbd keyLabel="E" control />}
              </DestructiveButton>
            </div>
          </div>

          <div className="space-y-6">
            <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
              <PersonalDetailsSection
                clientType={clientType}
                onClientTypeChange={setClientType}
                name={name}
                onNameChange={setName}
                document={document}
                onDocumentChange={setDocument}
              />

              <Separator />

              <AddressSection
                addresses={addresses}
                addAddress={addAddress}
                removeAddress={handleRemoveAddress}
                updateAddress={updateAddress}
                clientType={clientType}
                isMobile={isMobile}
              />

              <Separator />

              <PhoneSection
                phones={phones}
                addPhone={addPhone}
                removePhone={handleRemovePhone}
                updatePhone={updatePhone}
                clientType={clientType}
                isMobile={isMobile}
              />

              <Separator />

              <div className="flex justify-end gap-2">
                <SecondaryButton
                  type="button"
                  onClick={handleCancel}
                  size={isMobile ? 'sm' : 'default'}
                  className="h-10"
                >
                  {t('client.cancel')}
                  {!isMobile && <Kbd keyLabel="Esc" control />}
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  size={isMobile ? 'sm' : 'default'}
                  className="h-10"
                  disabled={name.trim() === ''}
                >
                  {t(submitKey)}
                  {!isMobile && <Kbd keyLabel="S" control />}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </Card>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open && !isControlled) {
            handleCancelDiscard();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('client.discard.title')}</DialogTitle>
            <DialogDescription>
              {t('client.discard.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton
              type="button"
              onClick={handleCancelDiscard}
              shortcut="Esc"
            >
              {t('client.discard.cancel')}
            </SecondaryButton>
            <DestructiveButton type="button" onClick={handleConfirmDiscard}>
              {t('client.discard.continue')}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

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
  useToasts,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { useResponsive } from '@automatize/ui/responsive';
import type { ProfileScreenProps, Phone } from './ProfileScreen.types';
import { useProfileForm } from './useProfileForm';
import { useProfileSafe } from './ProfileProvider';
import { AccountInfoSection } from './components/AccountInfoSection/AccountInfoSection.web';
import { PersonalSection } from './components/PersonalSection/PersonalSection.web';
import { PasswordSection } from './components/PasswordSection/PasswordSection.web';

type NewPhoneFields = Omit<Phone, 'id'>;

const EMPTY_PHONE: NewPhoneFields = {
  phoneType: 'mobile',
  number: '',
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  email: emailProp = '',
  companyName: companyNameProp = '',
  initialData,
  onSubmit,
  onChangePassword,
  onBack,
  showDiscardDialog,
  onDiscardCancel,
}) => {
  const { t } = useTranslation();
  const toast = useToasts();
  const { isMobile } = useResponsive();
  const profileCtx = useProfileSafe();

  const resolvedEmail = profileCtx?.profile.email ?? emailProp;
  const resolvedCompanyName =
    profileCtx?.profile.companyName ?? companyNameProp;

  const {
    name,
    setName,
    phones,
    addPhone,
    removePhone,
    insertPhoneAt,
    updatePhone,
    getFormData,
    resetForm,
  } = useProfileForm({
    initialData: {
      name: profileCtx?.profile.name ?? initialData?.name ?? '',
      phones: profileCtx?.profile.phones ?? initialData?.phones ?? [],
    },
  });

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
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [newPhone, setNewPhone] = useState<NewPhoneFields>(EMPTY_PHONE);
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [showAllPhones, setShowAllPhones] = useState(false);

  const isControlled = showDiscardDialog !== undefined;
  const dialogOpen = isControlled ? showDiscardDialog : internalDialogOpen;

  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = getFormData();
    profileCtx?.updateProfile({ name: data.name, phones: data.phones });
    onSubmit(data);
    toast.message({ text: t('profile.saved') });
  };

  const handleSave = useCallback(() => {
    if (name.trim() === '') return;
    const data = getFormData();
    profileCtx?.updateProfile({ name: data.name, phones: data.phones });
    onSubmit(data);
    toast.message({ text: t('profile.saved') });
  }, [name, onSubmit, getFormData, profileCtx, toast, t]);

  const handleCancel = useCallback(() => {
    resetForm();
    onBack?.();
  }, [resetForm, onBack]);

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, handleCancel]);

  return (
    <>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Card padding="lg">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('profile.form.title')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('profile.form.description')}
            </p>
          </div>

          <div className="space-y-6">
            <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
              {/* Section 1: Account Info (read-only) */}
              <AccountInfoSection
                email={resolvedEmail}
                companyName={resolvedCompanyName}
              />

              <Separator />

              {/* Section 2: Personal Details (name + phones) */}
              <PersonalSection
                name={name}
                onNameChange={setName}
                phones={phones}
                addPhone={addPhone}
                removePhone={handleRemovePhone}
                updatePhone={updatePhone}
                isPhoneDialogOpen={phoneDialogOpen}
                onPhoneDialogOpenChange={setPhoneDialogOpen}
                newPhone={newPhone}
                onNewPhoneChange={setNewPhone}
                editingPhoneId={editingPhoneId}
                onEditingPhoneIdChange={setEditingPhoneId}
                showAllPhones={showAllPhones}
                onShowAllPhonesChange={setShowAllPhones}
                isMobile={isMobile}
              />

              <Separator />

              {/* Section 3: Password */}
              <PasswordSection
                onChangePassword={onChangePassword}
                isMobile={isMobile}
              />

              <Separator />

              {/* Footer */}
              <div className="flex justify-end gap-2">
                <SecondaryButton
                  type="button"
                  onClick={handleCancel}
                  size={isMobile ? 'sm' : 'default'}
                  className="h-10"
                >
                  {t('profile.cancel')}
                  {!isMobile && <Kbd keyLabel="Esc" control />}
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  size={isMobile ? 'sm' : 'default'}
                  className="h-10"
                  disabled={name.trim() === ''}
                >
                  {t('profile.submit')}
                  {!isMobile && <Kbd keyLabel="S" control />}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </Card>
      </div>

      {/* Discard confirmation dialog */}
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
            <DialogTitle>{t('profile.discard.title')}</DialogTitle>
            <DialogDescription>
              {t('profile.discard.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton
              type="button"
              onClick={handleCancelDiscard}
              shortcut="Esc"
            >
              {t('profile.discard.cancel')}
            </SecondaryButton>
            <DestructiveButton type="button" onClick={handleConfirmDiscard}>
              {t('profile.discard.continue')}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { useResponsive } from '@automatize/ui/responsive';
import type {
  ClientFormScreenProps,
  Address,
  Phone,
} from './ClientFormScreen.types';
import { useClientForm } from './useClientForm';
import { AddressSection } from './components/AddressSection/AddressSection.web';
import { PhoneSection } from './components/PhoneSection/PhoneSection.web';
import { PersonalDetailsSection } from './components/PersonalDetailsSection/PersonalDetailsSection.web';

type NewAddressFields = Omit<Address, 'id'>;
type NewPhoneFields = Omit<Phone, 'id'>;

const EMPTY_ADDRESS: NewAddressFields = {
  addressType: 'residence',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  info: '',
};

const EMPTY_PHONE: NewPhoneFields = {
  phoneType: 'mobile',
  number: '',
};

export const ClientFormScreen: React.FC<ClientFormScreenProps> = ({
  onSubmit,
  initialData,
  onDataChange,
  onBack,
  showDiscardDialog,
  onDiscardCancel,
}) => {
  const { t } = useTranslation();
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
    updateAddress,
    phones,
    addPhone,
    removePhone,
    updatePhone,
    getFormData,
    resetForm,
  } = useClientForm({ initialData, onDataChange });

  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddressFields>(EMPTY_ADDRESS);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [newPhone, setNewPhone] = useState<NewPhoneFields>(EMPTY_PHONE);
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [showAllPhones, setShowAllPhones] = useState(false);

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

  const { isMobile } = useResponsive();

  return (
    <>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Card padding="lg">
          <div className="space-y-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Personal Details Section */}
              <PersonalDetailsSection
                clientType={clientType}
                onClientTypeChange={setClientType}
                name={name}
                onNameChange={setName}
                document={document}
                onDocumentChange={setDocument}
              />

              <Separator />

              {/* Addresses Section */}
              <AddressSection
                addresses={addresses}
                addAddress={addAddress}
                removeAddress={removeAddress}
                updateAddress={updateAddress}
                isDialogOpen={addressDialogOpen}
                onDialogOpenChange={setAddressDialogOpen}
                newAddress={newAddress}
                onNewAddressChange={setNewAddress}
                editingAddressId={editingAddressId}
                onEditingAddressIdChange={setEditingAddressId}
                showAllAddresses={showAllAddresses}
                onShowAllAddressesChange={setShowAllAddresses}
                isMobile={isMobile}
              />

              <Separator />

              {/* Phones Section */}
              <PhoneSection
                phones={phones}
                addPhone={addPhone}
                removePhone={removePhone}
                updatePhone={updatePhone}
                isDialogOpen={phoneDialogOpen}
                onDialogOpenChange={setPhoneDialogOpen}
                newPhone={newPhone}
                onNewPhoneChange={setNewPhone}
                editingPhoneId={editingPhoneId}
                onEditingPhoneIdChange={setEditingPhoneId}
                showAllPhones={showAllPhones}
                onShowAllPhonesChange={setShowAllPhones}
                isMobile={isMobile}
              />

              <Separator />

              {/* Submit */}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="destructive" onClick={resetForm}>
                  {t('client.reset')}
                </Button>
                <Button type="submit">{t('client.submit')}</Button>
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
            <DialogTitle>{t('client.discard.title')}</DialogTitle>
            <DialogDescription>
              {t('client.discard.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDiscard}
              shortcut="Esc"
            >
              {t('client.discard.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDiscard}
            >
              {t('client.discard.continue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

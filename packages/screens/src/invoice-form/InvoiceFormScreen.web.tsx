import React, { useState, useEffect, useCallback } from 'react';
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
import type {
  InvoiceFormScreenProps,
  ClientAddress,
  ClientPhone,
} from './InvoiceFormScreen.types';
import { useInvoiceForm } from './useInvoiceForm';
import { ClientSection } from './components/ClientSection/ClientSection.web';
import { ProductsSection } from './components/ProductsSection/ProductsSection.web';
import { TechniciansSection } from './components/TechniciansSection/TechniciansSection.web';
import { WarrantySection } from './components/WarrantySection/WarrantySection.web';

export const InvoiceFormScreen: React.FC<InvoiceFormScreenProps> = ({
  mode = 'create',
  onSubmit,
  initialData,
  onDataChange,
  onBack,
  showDiscardDialog,
  onDiscardCancel,
  availableClients,
  availableProducts,
  availableTechnicians,
  defaultWarrantyOptions,
  onSaveAddressToClient,
  onSavePhoneToClient,
  onAddTechnician,
  onSaveTechnicianToTable,
  onAddWarrantyOption,
}) => {
  const isEdit = mode === 'edit';
  const titleKey = isEdit ? 'invoice.form.title.edit' : 'invoice.form.title';
  const descriptionKey = isEdit
    ? 'invoice.form.description.edit'
    : 'invoice.form.description';
  const submitKey = isEdit ? 'invoice.submit.edit' : 'invoice.submit';

  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const toast = useToasts();

  const {
    clientId,
    clientName,
    clientAddresses,
    clientPhones,
    selectClient,
    clearClient,
    pickClientAddress,
    addClientAddress,
    removeClientAddress,
    pickClientPhone,
    addClientPhone,
    removeClientPhone,
    products,
    addProduct,
    removeProduct,
    updateProductQuantity,
    incrementProductQuantity,
    decrementProductQuantity,
    technicians,
    addTechnician,
    removeTechnician,
    toggleTechnician,
    addNewTechnician,
    warrantyMonths,
    setWarrantyMonths,
    additionalInfo,
    setAdditionalInfo,
    total,
    getFormData,
    resetForm,
  } = useInvoiceForm({ initialData, onDataChange });

  const [internalDialogOpen, setInternalDialogOpen] = useState(false);

  const isControlled = showDiscardDialog !== undefined;
  const dialogOpen = isControlled ? showDiscardDialog : internalDialogOpen;

  const hasFormData =
    !!clientId ||
    products.length > 0 ||
    technicians.length > 0 ||
    additionalInfo.trim() !== '';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(getFormData());
  };

  const handleSave = useCallback(() => {
    if (!clientId) return;
    onSubmit(getFormData());
  }, [clientId, onSubmit, getFormData]);

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

  // ── beforeunload guard ────────────────────────────────────────────────────

  useEffect(() => {
    if (!hasFormData) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasFormData]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

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

  // ── Technician callbacks ──────────────────────────────────────────────────

  const handleAddNewTechnician = useCallback(
    (name: string) => {
      addNewTechnician(name);
      onAddTechnician?.(name);
    },
    [addNewTechnician, onAddTechnician]
  );

  // ── Client address/phone save-to-profile callbacks ────────────────────────

  const handleSaveAddressToClient = onSaveAddressToClient
    ? (address: ClientAddress) => {
        if (clientId) onSaveAddressToClient(clientId, address);
        toast.success(t('invoice.client.address.save'));
      }
    : undefined;

  const handleSavePhoneToClient = onSavePhoneToClient
    ? (phone: ClientPhone) => {
        if (clientId) onSavePhoneToClient(clientId, phone);
        toast.success(t('invoice.client.phone.save'));
      }
    : undefined;

  return (
    <>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Card padding="lg">
          {/* Header */}
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
                className="w-full sm:w-auto"
              >
                {t('invoice.reset')}
                {!isMobile && <DestructiveKbd keyLabel="E" control />}
              </DestructiveButton>
            </div>
          </div>

          <div className="space-y-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Client */}
              <ClientSection
                availableClients={availableClients}
                selectedClientId={clientId}
                selectedClientName={clientName}
                clientAddresses={clientAddresses}
                clientPhones={clientPhones}
                onSelectClient={selectClient}
                onClearClient={clearClient}
                onSelectAddress={pickClientAddress}
                onAddAddress={addClientAddress}
                onRemoveAddress={removeClientAddress}
                onTogglePhone={pickClientPhone}
                onAddPhone={addClientPhone}
                onRemovePhone={removeClientPhone}
                onSaveAddressToClient={handleSaveAddressToClient}
                onSavePhoneToClient={handleSavePhoneToClient}
              />

              <Separator />

              {/* Products */}
              <ProductsSection
                availableProducts={availableProducts}
                selectedProducts={products}
                invoiceTotal={total}
                onAddProduct={addProduct}
                onRemoveProduct={removeProduct}
                onUpdateQuantity={updateProductQuantity}
                onIncrementQuantity={incrementProductQuantity}
                onDecrementQuantity={decrementProductQuantity}
              />

              <Separator />

              {/* Technicians */}
              <TechniciansSection
                availableTechnicians={availableTechnicians}
                selectedTechnicians={technicians}
                onAddTechnician={addTechnician}
                onToggleTechnician={toggleTechnician}
                onRemoveTechnician={removeTechnician}
                onAddNewTechnician={handleAddNewTechnician}
                onSaveTechnicianToTable={onSaveTechnicianToTable}
              />

              <Separator />

              {/* Warranty + Additional Info */}
              <WarrantySection
                warrantyMonths={warrantyMonths}
                onWarrantyChange={setWarrantyMonths}
                additionalInfo={additionalInfo}
                onAdditionalInfoChange={setAdditionalInfo}
                warrantyOptions={defaultWarrantyOptions}
                onAddWarrantyOption={onAddWarrantyOption}
              />

              <Separator />

              {/* Footer actions */}
              <div className="flex justify-end gap-2">
                <SecondaryButton
                  type="button"
                  onClick={handleCancel}
                  size={isMobile ? 'sm' : 'default'}
                >
                  {t('invoice.cancel')}
                  {!isMobile && <Kbd keyLabel="Esc" control />}
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  size={isMobile ? 'sm' : 'default'}
                  disabled={!clientId}
                >
                  {t(submitKey)}
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
            <DialogTitle>{t('invoice.discard.title')}</DialogTitle>
            <DialogDescription>
              {t('invoice.discard.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton
              type="button"
              onClick={handleCancelDiscard}
              shortcut="Esc"
            >
              {t('invoice.discard.cancel')}
            </SecondaryButton>
            <DestructiveButton type="button" onClick={handleConfirmDiscard}>
              {t('invoice.discard.continue')}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

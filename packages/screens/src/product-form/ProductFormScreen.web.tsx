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
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { useResponsive } from '@automatize/ui/responsive';
import type { ProductFormScreenProps } from './ProductFormScreen.types';
import { useProductForm } from './useProductForm';
import { PhotoSection } from './components/PhotoSection/PhotoSection.web';
import { ProductDetailsSection } from './components/ProductDetailsSection/ProductDetailsSection.web';
import { SupplierSection } from './components/SupplierSection/SupplierSection.web';

export const ProductFormScreen: React.FC<ProductFormScreenProps> = ({
  mode = 'create',
  onSubmit,
  initialData,
  onDataChange,
  onBack,
  showDiscardDialog,
  onDiscardCancel,
  suppliers = [],
  onAddSupplier,
}) => {
  const isEdit = mode === 'edit';
  const titleKey = isEdit ? 'product.form.title.edit' : 'product.form.title';
  const descriptionKey = isEdit
    ? 'product.form.description.edit'
    : 'product.form.description';
  const submitKey = isEdit ? 'product.submit.edit' : 'product.submit';

  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  const {
    name,
    setName,
    price,
    setPrice,
    quantity,
    setQuantity,
    info,
    setInfo,
    photoUrl,
    setPhotoUrl,
    setPhotoFile,
    companyId,
    setCompanyId,
    getFormData,
    resetForm,
  } = useProductForm({ initialData, onDataChange });

  const [internalDialogOpen, setInternalDialogOpen] = useState(false);

  const isControlled = showDiscardDialog !== undefined;
  const dialogOpen = isControlled ? showDiscardDialog : internalDialogOpen;

  const hasFormData =
    name.trim() !== '' ||
    price.trim() !== '' ||
    quantity.trim() !== '' ||
    info.trim() !== '' ||
    !!photoUrl ||
    !!companyId;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(getFormData());
  };

  const handleSave = useCallback(() => {
    if (name.trim() === '') return;
    onSubmit(getFormData());
  }, [name, onSubmit, getFormData]);

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

  const handlePhotoChange = useCallback(
    (file: File | null, previewUrl: string | null) => {
      setPhotoFile(file ?? undefined);
      setPhotoUrl(previewUrl ?? undefined);
    },
    [setPhotoFile, setPhotoUrl]
  );

  useEffect(() => {
    if (!hasFormData) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasFormData]);

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
                {t('product.reset')}
                {!isMobile && <DestructiveKbd keyLabel="E" control />}
              </DestructiveButton>
            </div>
          </div>

          <div className="space-y-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <PhotoSection
                photoUrl={photoUrl}
                onPhotoChange={handlePhotoChange}
              />

              <Separator />

              <ProductDetailsSection
                name={name}
                onNameChange={setName}
                price={price}
                onPriceChange={setPrice}
                quantity={quantity}
                onQuantityChange={setQuantity}
                info={info}
                onInfoChange={setInfo}
              />

              <Separator />

              <SupplierSection
                suppliers={suppliers}
                selectedSupplierId={companyId}
                onSupplierSelect={setCompanyId}
                onAddSupplier={onAddSupplier}
              />

              <Separator />

              <div className="flex justify-end gap-2">
                <SecondaryButton
                  type="button"
                  onClick={handleCancel}
                  size={isMobile ? 'sm' : 'default'}
                  className="h-10"
                >
                  {t('product.cancel')}
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
            <DialogTitle>{t('product.discard.title')}</DialogTitle>
            <DialogDescription>
              {t('product.discard.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton
              type="button"
              onClick={handleCancelDiscard}
              shortcut="Esc"
            >
              {t('product.discard.cancel')}
            </SecondaryButton>
            <DestructiveButton type="button" onClick={handleConfirmDiscard}>
              {t('product.discard.continue')}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

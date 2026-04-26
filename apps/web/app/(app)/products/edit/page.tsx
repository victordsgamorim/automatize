'use client';

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@automatize/navigation';
import { useTranslation, SUPPORTED_LANGUAGES } from '@automatize/localization';
import { useTheme, THEME_PREFERENCES } from '@automatize/theme';
import { ProductFormScreen } from '@automatize/screens/product-form/web';
import type {
  ProductFormData,
  Supplier,
} from '@automatize/screens/product-form/web';
import type { ProductRow } from '@automatize/screens/product/web';
import { useProductContext } from '@automatize/screens/product/web';
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
import { useQueryClient } from '@tanstack/react-query';
import { getProductFormData, updateSavedProduct } from '../productStore';
import { useProduct } from '../hooks';
import type { Product } from '@automatize/screens/product/data';
import {
  useSuppliersData,
  createSupplierInCache,
  SUPPLIERS_QUERY_KEY,
} from '../../supplier/hooks';

let formDraft: Partial<ProductFormData> | undefined;

function productToFormData(product: Product): ProductFormData {
  return {
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    info: product.info,
    photoUrl: product.photoUrl,
    companyId: product.companyId,
  };
}

function productRowToFormData(row: ProductRow): ProductFormData {
  return {
    name: row.name,
    price: row.price,
    quantity: row.quantity,
    info: row.info ?? '',
    photoUrl: row.photo,
    companyId: row.companyId,
  };
}

function toProductRow(
  data: ProductFormData,
  id: string,
  suppliers: Supplier[]
): ProductRow {
  const supplier = suppliers.find((s) => s.id === data.companyId);
  return {
    id,
    name: data.name,
    price: data.price,
    quantity: data.quantity,
    info: data.info || undefined,
    photo: data.photoUrl,
    companyId: data.companyId,
    companyName: supplier?.name,
  };
}

export default function EditProductPage(): React.JSX.Element {
  const { navigate } = useNavigation();
  const { i18n, t } = useTranslation();
  const { preference, isDark, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { productIdToEdit, clearProductToEdit, products } = useProductContext();
  const { data: remoteProduct } = useProduct(productIdToEdit ?? '');
  const [initialData, setInitialData] = useState<ProductFormData | undefined>(
    () => {
      if (productIdToEdit) {
        const fromStore = getProductFormData(productIdToEdit);
        if (fromStore) return fromStore;
        const fromList = products.find((p) => p.id === productIdToEdit);
        if (fromList) return productRowToFormData(fromList);
      }
      return formDraft as ProductFormData | undefined;
    }
  );

  useEffect(() => {
    if (productIdToEdit && remoteProduct && !initialData) {
      setInitialData(productToFormData(remoteProduct));
    }
  }, [productIdToEdit, remoteProduct, initialData]);

  const { data: suppliersData } = useSuppliersData();
  const suppliers = useMemo<Supplier[]>(
    () =>
      suppliersData?.suppliers.map((s) => ({ id: s.id, name: s.name })) ?? [],
    [suppliersData]
  );

  const [pendingData, setPendingData] = useState<ProductFormData | null>(null);
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

  const handleDataChange = useCallback((data: Partial<ProductFormData>) => {
    formDraft = data;
  }, []);

  const handleSubmit = (data: ProductFormData) => {
    setPendingData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirm = useCallback(() => {
    if (!productIdToEdit || !pendingData) return;
    updateSavedProduct(
      productIdToEdit,
      toProductRow(pendingData, productIdToEdit, suppliers),
      pendingData
    );
    clearProductToEdit();
    formDraft = undefined;
    navigate('/products');
  }, [productIdToEdit, pendingData, suppliers, clearProductToEdit, navigate]);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingData(null);
  }, []);

  const handleBack = () => {
    formDraft = undefined;
    clearProductToEdit();
    navigate('/products');
  };

  const handleDiscardCancel = () => {
    setShowDiscardDialog(false);
    window.history.pushState(null, '', window.location.href);
  };

  const handleAddSupplier = (name: string) => {
    void createSupplierInCache(name).then(() =>
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] })
    );
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
      <ProductFormScreen
        key={initialData ? productIdToEdit : undefined}
        mode="edit"
        onSubmit={handleSubmit}
        initialData={initialData}
        onDataChange={handleDataChange}
        onBack={handleBack}
        showDiscardDialog={showDiscardDialog}
        onDiscardCancel={handleDiscardCancel}
        suppliers={suppliers}
        onAddSupplier={handleAddSupplier}
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
            <DialogTitle>{t('product.edit.confirm.title')}</DialogTitle>
            <DialogDescription>
              {t('product.edit.confirm.description', {
                name: pendingData?.name ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton type="button" onClick={handleCancelConfirm}>
              {t('product.discard.cancel')}
              <Kbd keyLabel="Esc" />
            </SecondaryButton>
            <PrimaryButton type="button" onClick={handleConfirm}>
              {t('product.discard.continue')}
              <Kbd keyLabel="Enter" />
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

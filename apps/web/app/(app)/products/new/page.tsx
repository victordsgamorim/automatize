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
import { generateId } from '@automatize/utils';
import { useQueryClient } from '@tanstack/react-query';
import { addSavedProduct } from '../productStore';
import {
  useSuppliersData,
  createSupplierInCache,
  SUPPLIERS_QUERY_KEY,
} from '../../supplier/hooks';

let formDraft: Partial<ProductFormData> | undefined;

function toProductRow(
  data: ProductFormData,
  suppliers: Supplier[]
): ProductRow {
  const supplier = suppliers.find((s) => s.id === data.companyId);
  return {
    id: generateId(),
    name: data.name,
    price: data.price,
    quantity: data.quantity,
    info: data.info || undefined,
    photo: data.photoUrl,
    companyId: data.companyId,
    companyName: supplier?.name,
  };
}

export default function NewProductPage(): React.JSX.Element {
  const { navigate } = useNavigation();
  const { i18n, t } = useTranslation();
  const { preference, isDark, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const [initialData] = useState(() => formDraft);
  const { data: suppliersData } = useSuppliersData();
  const suppliers = useMemo<Supplier[]>(
    () =>
      suppliersData?.suppliers.map((s) => ({ id: s.id, name: s.name })) ?? [],
    [suppliersData]
  );
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
    addSavedProduct(toProductRow(data, suppliers), data);
    formDraft = undefined;
    navigate('/products');
  };

  const handleBack = () => {
    formDraft = undefined;
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

  return (
    <ProductFormScreen
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
  );
}

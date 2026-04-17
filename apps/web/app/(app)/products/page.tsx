'use client';

import React, { useState } from 'react';
import { useNavigation } from '@automatize/navigation';
import { useTranslation, SUPPORTED_LANGUAGES } from '@automatize/localization';
import { useTheme, THEME_PREFERENCES } from '@automatize/theme';
import { ProductScreen } from '@automatize/screens/product/web';
import type { ProductRow } from '@automatize/screens/product/web';
import { getSavedProducts, setProductToEdit } from './productStore';

export default function ProductsPage(): React.JSX.Element {
  const { navigate } = useNavigation();
  const { i18n, t } = useTranslation();
  const { preference, isDark, setTheme } = useTheme();

  const [products] = useState(() => getSavedProducts());

  const handleEditProduct = (product: ProductRow) => {
    setProductToEdit(product.id);
    navigate('/products/edit');
  };

  return (
    <ProductScreen
      products={products}
      onAddProduct={() => navigate('/products/new')}
      onEditProduct={handleEditProduct}
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

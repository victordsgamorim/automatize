'use client';

import React, { useMemo } from 'react';
import { ProductProvider } from '@automatize/screens/product/web';
import { useProductsData, toProductRow } from './hooks';
import { applyStockDeltas } from './productStore';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { data, isLoading, error } = useProductsData();
  const products = useMemo(
    () => applyStockDeltas(data?.products.map(toProductRow) ?? []),
    [data]
  );

  return (
    <ProductProvider
      products={products}
      isLoading={isLoading}
      error={error ?? null}
    >
      {children}
    </ProductProvider>
  );
}

'use client';

import React from 'react';
import {
  SupplierScreen,
  useSupplierContext,
} from '@automatize/screens/supplier/web';

export default function SupplierPage(): React.JSX.Element {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } =
    useSupplierContext();

  return (
    <SupplierScreen
      suppliers={suppliers}
      onAdd={addSupplier}
      onEdit={updateSupplier}
      onDelete={deleteSupplier}
    />
  );
}

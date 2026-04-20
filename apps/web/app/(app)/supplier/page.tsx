'use client';

import React, { useState } from 'react';
import { SupplierScreen } from '@automatize/screens/supplier/web';
import type { SupplierRow } from '@automatize/screens/supplier/web';
import {
  getSavedSuppliers,
  addSavedSupplier,
  updateSavedSupplier,
  deleteSavedSupplier,
} from '../products/productStore';

export default function SupplierPage(): React.JSX.Element {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>(() =>
    getSavedSuppliers()
  );

  const handleAdd = (name: string) => {
    const supplier = addSavedSupplier(name);
    setSuppliers((prev) => [...prev, supplier]);
  };

  const handleEdit = (id: string, name: string) => {
    updateSavedSupplier(id, name);
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const handleDelete = (id: string) => {
    deleteSavedSupplier(id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SupplierScreen
      suppliers={suppliers}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}

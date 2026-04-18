'use client';

import React, { useState } from 'react';
import { TechnicianScreen } from '@automatize/screens/technician/web';
import type { TechnicianRow } from '@automatize/screens/technician/web';
import { generateId } from '@automatize/utils';

export default function TechnicianPage(): React.JSX.Element {
  const [technicians, setTechnicians] = useState<TechnicianRow[]>([]);

  const handleAdd = (name: string, entryDate: string) => {
    setTechnicians((prev) => [...prev, { id: generateId(), name, entryDate }]);
  };

  const handleEdit = (id: string, name: string, entryDate: string) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name, entryDate } : t))
    );
  };

  const handleDelete = (id: string) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TechnicianScreen
      technicians={technicians}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}

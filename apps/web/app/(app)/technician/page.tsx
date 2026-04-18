'use client';

import React, { useState } from 'react';
import { TechnicianScreen } from '@automatize/screens/technician/web';
import type { TechnicianRow } from '@automatize/screens/technician/web';
import {
  getSavedTechnicians,
  addSavedTechnician,
  updateSavedTechnician,
  deleteSavedTechnician,
} from './technicianStore';

export default function TechnicianPage(): React.JSX.Element {
  const [technicians, setTechnicians] = useState<TechnicianRow[]>(() =>
    getSavedTechnicians()
  );

  const handleAdd = (name: string, entryDate: string) => {
    const tech = addSavedTechnician(name, entryDate);
    setTechnicians((prev) => [...prev, tech]);
  };

  const handleEdit = (id: string, name: string, entryDate: string) => {
    updateSavedTechnician(id, name, entryDate);
    setTechnicians((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name, entryDate } : t))
    );
  };

  const handleDelete = (id: string) => {
    deleteSavedTechnician(id);
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

'use client';

import React, { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TechnicianProvider } from '@automatize/screens/technician/web';
import {
  useTechniciansData,
  toTechnicianRow,
  addTechnicianToCache,
  updateTechnicianInCache,
  deleteTechnicianInCache,
} from './hooks';
import {
  addSavedTechnician,
  updateSavedTechnician,
  deleteSavedTechnician,
} from './technicianStore';

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { data, isLoading, error } = useTechniciansData();
  const technicians = useMemo(
    () => data?.technicians.map(toTechnicianRow) ?? [],
    [data]
  );
  const queryClient = useQueryClient();

  const handleAdd = useCallback(
    (name: string, entryDate: string) => {
      addSavedTechnician(name, entryDate);
      addTechnicianToCache(queryClient, name, entryDate);
    },
    [queryClient]
  );

  const handleUpdate = useCallback(
    (id: string, name: string, entryDate: string) => {
      updateSavedTechnician(id, name, entryDate);
      updateTechnicianInCache(queryClient, id, name, entryDate);
    },
    [queryClient]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteSavedTechnician(id);
      deleteTechnicianInCache(queryClient, id);
    },
    [queryClient]
  );

  return (
    <TechnicianProvider
      technicians={technicians}
      isLoading={isLoading}
      error={error ?? null}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    >
      {children}
    </TechnicianProvider>
  );
}

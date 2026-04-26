'use client';

import React, { useMemo } from 'react';
import { TechnicianProvider } from '@automatize/screens/technician/web';
import { useTechniciansData, toTechnicianRow } from './hooks';

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

  return (
    <TechnicianProvider
      initialTechnicians={technicians}
      isLoading={isLoading}
      error={error ?? null}
    >
      {children}
    </TechnicianProvider>
  );
}

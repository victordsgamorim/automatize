'use client';

import React from 'react';
import {
  TechnicianScreen,
  useTechnicianContext,
} from '@automatize/screens/technician/web';

export default function TechnicianPage(): React.JSX.Element {
  const { technicians, addTechnician, updateTechnician, deleteTechnician } =
    useTechnicianContext();

  return (
    <TechnicianScreen
      technicians={technicians}
      onAdd={addTechnician}
      onEdit={updateTechnician}
      onDelete={deleteTechnician}
    />
  );
}

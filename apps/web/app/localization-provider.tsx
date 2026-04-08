'use client';

import {
  LocalizationProvider,
  initLocalization,
  createLocalLoader,
} from '@automatize/localization';
import React, { type ReactNode } from 'react';

// Start fetching translations immediately when this module is first imported —
// before the React tree mounts. The singleton ensures this runs only once
// per app session, never again until the page is reloaded.
initLocalization(createLocalLoader(), 'pt-BR');

export function LocalizationWrapper({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return <LocalizationProvider>{children}</LocalizationProvider>;
}

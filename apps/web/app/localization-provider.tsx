'use client';

import {
  LocalizationProvider,
  initLocalization,
  createLocalLoader,
} from '@automatize/localization';
import type { ReactNode } from 'react';

// Start fetching translations immediately when this module is first imported —
// before the React tree mounts. The singleton ensures this runs only once
// per app session, never again until the page is reloaded.
initLocalization(createLocalLoader(), 'pt-BR');

export function LocalizationWrapper({ children }: { children: ReactNode }) {
  return <LocalizationProvider>{children}</LocalizationProvider>;
}

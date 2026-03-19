'use client';

import {
  ThemeProvider,
  initTheme,
  createWebStorageAdapter,
} from '@automatize/theme';
import type { ReactNode } from 'react';

// Start reading stored theme preference immediately when this module
// is first imported — before the React tree mounts. Singleton ensures
// this runs only once per app session.
initTheme({ storageAdapter: createWebStorageAdapter() });

export function ThemeWrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

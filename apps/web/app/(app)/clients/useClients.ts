'use client';

import { useSyncExternalStore } from 'react';
import type { ClientRow } from '@automatize/screens/client/web';
import { subscribe, getSnapshot } from './clientStore';

export function useClients(): ClientRow[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

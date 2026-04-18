# Plan: Reactive Client Store for Cross-Component Address/Phone Updates

## Goal

When adding a new Address or Phone to a client from the InvoiceFormScreen, reactively update:

1. The `/clients` table (ClientScreen)
2. The client detail drawer
3. The `/clients/edit` form (ClientFormScreen)

## Architecture

Convert `clientStore.ts` into a reactive store using a listener/subscription pattern, consumed via React's `useSyncExternalStore`.

---

## Step 1: Update `apps/web/app/(app)/clients/clientStore.ts`

Add a subscriber pattern and new mutation functions. Full replacement:

```ts
import type { ClientRow } from '@automatize/screens/client/web';
import type {
  ClientAddress,
  ClientPhone,
} from '@automatize/screens/client/web';
import type { ClientFormData } from '@automatize/screens/client-form/web';

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange(): void {
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): ClientRow[] {
  return savedClients;
}

let savedClients: ClientRow[] = [];
const clientFormDataMap = new Map<string, ClientFormData>();
let clientIdToEdit: string | undefined;

export function getSavedClients(): ClientRow[] {
  return savedClients;
}

export function addSavedClient(row: ClientRow, formData: ClientFormData): void {
  savedClients = [row, ...savedClients];
  clientFormDataMap.set(row.id, formData);
  emitChange();
}

export function getClientFormData(id: string): ClientFormData | undefined {
  return clientFormDataMap.get(id);
}

export function updateSavedClient(
  id: string,
  row: ClientRow,
  formData: ClientFormData
): void {
  savedClients = savedClients.map((c) => (c.id === id ? row : c));
  clientFormDataMap.set(id, formData);
  emitChange();
}

export function addAddressToClient(
  clientId: string,
  address: ClientAddress
): void {
  savedClients = savedClients.map((c) =>
    c.id === clientId ? { ...c, addresses: [...c.addresses, address] } : c
  );
  const formData = clientFormDataMap.get(clientId);
  if (formData) {
    clientFormDataMap.set(clientId, {
      ...formData,
      addresses: [...formData.addresses, address],
    });
  }
  emitChange();
}

export function addPhoneToClient(clientId: string, phone: ClientPhone): void {
  savedClients = savedClients.map((c) =>
    c.id === clientId ? { ...c, phones: [...c.phones, phone] } : c
  );
  const formData = clientFormDataMap.get(clientId);
  if (formData) {
    clientFormDataMap.set(clientId, {
      ...formData,
      phones: [...formData.phones, phone],
    });
  }
  emitChange();
}

export function setClientToEdit(id: string): void {
  clientIdToEdit = id;
}

export function getClientIdToEdit(): string | undefined {
  return clientIdToEdit;
}

export function clearClientToEdit(): void {
  clientIdToEdit = undefined;
}
```

Key changes:

- Added `Listener` type, `listeners` Set, `emitChange()`, `subscribe()`, `getSnapshot()`
- Added `addAddressToClient()` — updates both `savedClients` AND `clientFormDataMap`, then emits
- Added `addPhoneToClient()` — same pattern for phones
- Added `emitChange()` calls to `addSavedClient()` and `updateSavedClient()`
- New imports: `ClientAddress`, `ClientPhone` from `@automatize/screens/client/web`

---

## Step 2: Create `apps/web/app/(app)/clients/useClients.ts` (NEW FILE)

```ts
'use client';

import { useSyncExternalStore } from 'react';
import type { ClientRow } from '@automatize/screens/client/web';
import { subscribe, getSnapshot } from './clientStore';

export function useClients(): ClientRow[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
```

---

## Step 3: Update `apps/web/app/(app)/clients/page.tsx`

Replace `useState(() => getSavedClients())` with `useClients()`:

```diff
- import { getSavedClients, setClientToEdit } from './clientStore';
+ import { setClientToEdit } from './clientStore';
+ import { useClients } from './useClients';

  export default function ClientsPage(): React.JSX.Element {
    const { navigate } = useNavigation();
    const { i18n, t } = useTranslation();
    const { preference, isDark, setTheme } = useTheme();

-   const [clients] = useState(() => getSavedClients());
+   const clients = useClients();
```

Remove the `useState` import if no longer used (check first — `useState` is no longer needed in this file).

---

## Step 4: Update `apps/web/app/(app)/invoices/new/page.tsx`

Replace local state management for clients with reactive store calls:

```diff
- import { getSavedClients } from '../../clients/clientStore';
+ import { addAddressToClient, addPhoneToClient } from '../../clients/clientStore';
+ import { useClients } from '../../clients/useClients';

  export default function NewInvoicePage(): React.JSX.Element {
    const { navigate } = useNavigation();

    const [initialData] = useState(() => formDraft);
-   const [clients, setClients] = useState(() => getSavedClients());
+   const clients = useClients();
    const [products] = useState(() => getSavedProducts());
```

Update the handlers:

```diff
  const handleSaveAddressToClient = useCallback(
    (clientId: string, address: ClientAddress) => {
-     setClients((prev) =>
-       prev.map((c) =>
-         c.id === clientId ? { ...c, addresses: [...c.addresses, address] } : c
-       )
-     );
+     addAddressToClient(clientId, address);
    },
    []
  );

  const handleSavePhoneToClient = useCallback(
    (clientId: string, phone: ClientPhone) => {
-     setClients((prev) =>
-       prev.map((c) =>
-         c.id === clientId ? { ...c, phones: [...c.phones, phone] } : c
-       )
-     );
+     addPhoneToClient(clientId, phone);
    },
    []
  );
```

---

## Step 5: Update `apps/web/app/(app)/invoices/edit/page.tsx`

Same changes as Step 4:

```diff
- import { getSavedClients } from '../../clients/clientStore';
+ import { addAddressToClient, addPhoneToClient } from '../../clients/clientStore';
+ import { useClients } from '../../clients/useClients';

  export default function EditInvoicePage(): React.JSX.Element {
    const { navigate } = useNavigation();
    const { t } = useTranslation();

    const invoiceId = getInvoiceIdToEdit();
    const [initialData] = useState<InvoiceFormData | undefined>(() => {
      if (invoiceId) return getInvoiceFormData(invoiceId);
      return formDraft as InvoiceFormData | undefined;
    });

-   const [clients, setClients] = useState(() => getSavedClients());
+   const clients = useClients();
```

Update handlers same as Step 4.

---

## Step 6: Update `apps/web/app/(app)/clients/edit/page.tsx`

The edit page reads `getClientFormData(clientId)` on mount. Since `clientFormDataMap` is updated by `addAddressToClient`/`addPhoneToClient`, the form will have the correct data when the user navigates to edit. No changes needed here — it already reads from the store on mount, and the store is updated.

However, if the user wants live reactivity while the edit form is open (unlikely since they'd be on different routes), we could add a `useClientFormData` hook. For now, the mount-time read is sufficient.

---

## Step 7: Run verification

```bash
pnpm --filter @automatize/screens lint
pnpm --filter @automatize/screens typecheck
rtk pnpm --filter @automatize/screens build
```

Also typecheck the web app:

```bash
rtk pnpm --filter @automatize/web typecheck
```

---

## Summary of Changes

| File                                        | Action                                                             |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `apps/web/app/(app)/clients/clientStore.ts` | Add subscriber pattern + `addAddressToClient` + `addPhoneToClient` |
| `apps/web/app/(app)/clients/useClients.ts`  | **NEW** — `useSyncExternalStore` hook                              |
| `apps/web/app/(app)/clients/page.tsx`       | Use `useClients()` instead of `useState`                           |
| `apps/web/app/(app)/invoices/new/page.tsx`  | Use store functions instead of local state                         |
| `apps/web/app/(app)/invoices/edit/page.tsx` | Same as above                                                      |

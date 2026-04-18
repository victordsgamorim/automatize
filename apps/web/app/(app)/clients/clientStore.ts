import type {
  ClientRow,
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

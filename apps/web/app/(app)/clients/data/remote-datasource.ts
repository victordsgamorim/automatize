import type {
  Client,
  PaginatedResponse,
  CreateClientInput,
  UpdateClientInput,
} from './types';
import { clientSchema } from './validators';

const MOCK_DATA_URL = '/mock-data/clients.json';
const SIMULATED_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMockClients(): Promise<Client[]> {
  try {
    const res = await fetch(MOCK_DATA_URL);
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return data as Client[];
  } catch {
    return [];
  }
}

export class ClientRemoteDatasource {
  private _cache: Client[] | null = null;

  private async getClients(): Promise<Client[]> {
    if (this._cache) return this._cache;
    const clients = await fetchMockClients();
    this._cache = clients;
    return clients;
  }

  async fetchRemote(
    tenantId: string,
    cursor?: string
  ): Promise<PaginatedResponse<Client>> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getClients();
    let filtered = all.filter(
      (c) => c.tenantId === tenantId && c.deletedAt === null
    );

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (cursor) {
      const idx = filtered.findIndex((c) => c.id === cursor);
      if (idx >= 0) {
        filtered = filtered.slice(idx + 1);
      }
    }

    return {
      data: filtered,
      nextCursor: null,
      hasMore: false,
    };
  }

  async getById(id: string): Promise<Client> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getClients();
    const client = all.find((c) => c.id === id && c.deletedAt === null);
    if (!client) {
      throw new Error(`Client not found: ${id}`);
    }
    return clientSchema.parse(client);
  }

  async create(tenantId: string, input: CreateClientInput): Promise<Client> {
    await delay(SIMULATED_DELAY_MS);
    const now = new Date().toISOString();
    const client: Client = {
      id: crypto.randomUUID(),
      tenantId,
      name: input.name,
      clientType: input.clientType,
      document: input.document,
      email: input.email,
      addresses: input.addresses.map((a) => ({
        ...a,
        id: crypto.randomUUID(),
      })),
      phones: input.phones.map((p) => ({ ...p, id: crypto.randomUUID() })),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    const validated = clientSchema.parse(client);
    this._cache?.push(validated);
    return validated;
  }

  async update(
    id: string,
    tenantId: string,
    input: UpdateClientInput
  ): Promise<Client> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getClients();
    const existing = all.find((c) => c.id === id && c.deletedAt === null);
    if (!existing) throw new Error(`Client not found: ${id}`);
    if (existing.tenantId !== tenantId)
      throw new Error(`Tenant mismatch for client: ${id}`);
    const updated: Client = {
      ...existing,
      ...input,
      addresses:
        input.addresses?.map((a) => ({ ...a, id: crypto.randomUUID() })) ??
        existing.addresses,
      phones:
        input.phones?.map((p) => ({ ...p, id: crypto.randomUUID() })) ??
        existing.phones,
      updatedAt: new Date().toISOString(),
    };
    return clientSchema.parse(updated);
  }

  async softDelete(id: string, tenantId: string): Promise<Client> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getClients();
    const existing = all.find((c) => c.id === id && c.deletedAt === null);
    if (!existing) throw new Error(`Client not found: ${id}`);
    if (existing.tenantId !== tenantId)
      throw new Error(`Tenant mismatch for client: ${id}`);
    existing.deletedAt = new Date().toISOString();
    existing.updatedAt = new Date().toISOString();
    return clientSchema.parse(existing);
  }
}

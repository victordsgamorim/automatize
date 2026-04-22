import type {
  Client,
  PaginatedResponse,
  CreateClientInput,
  UpdateClientInput,
} from './types';
import { clientSchema } from './validators';
import { getMockClients, getMockClientById } from './mock-clients';

const SIMULATED_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ClientRemoteDatasource {
  async fetchRemote(
    tenantId: string,
    cursor?: string
  ): Promise<PaginatedResponse<Client>> {
    await delay(SIMULATED_DELAY_MS);
    return getMockClients(tenantId, cursor);
  }

  async getById(id: string): Promise<Client> {
    await delay(SIMULATED_DELAY_MS);
    const client = getMockClientById(id);
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
    return clientSchema.parse(client);
  }

  async update(
    id: string,
    tenantId: string,
    input: UpdateClientInput
  ): Promise<Client> {
    await delay(SIMULATED_DELAY_MS);
    const existing = getMockClientById(id);
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
    const existing = getMockClientById(id);
    if (!existing) throw new Error(`Client not found: ${id}`);
    if (existing.tenantId !== tenantId)
      throw new Error(`Tenant mismatch for client: ${id}`);
    return clientSchema.parse({
      ...existing,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

import type {
  Client,
  PaginatedResponse,
  CreateClientInput,
  UpdateClientInput,
} from './types';
import { createClientSchema, updateClientSchema } from './validators';
import type { ClientRemoteDatasource } from './remote-datasource';

export class ClientRepository {
  constructor(private readonly _remote: ClientRemoteDatasource) {}

  async getAll(
    tenantId: string,
    cursor?: string
  ): Promise<PaginatedResponse<Client>> {
    return this._remote.fetchRemote(tenantId, cursor);
  }

  async getById(id: string): Promise<Client> {
    return this._remote.getById(id);
  }

  async create(tenantId: string, input: CreateClientInput): Promise<Client> {
    const validated = createClientSchema.parse(input);
    return this._remote.create(tenantId, validated);
  }

  async update(
    id: string,
    tenantId: string,
    input: UpdateClientInput
  ): Promise<Client> {
    const validated = updateClientSchema.parse(input);
    return this._remote.update(id, tenantId, validated);
  }

  async softDelete(id: string, tenantId: string): Promise<Client> {
    return this._remote.softDelete(id, tenantId);
  }
}

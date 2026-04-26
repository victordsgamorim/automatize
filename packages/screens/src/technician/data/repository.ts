import type {
  Technician,
  PaginatedResponse,
  CreateTechnicianInput,
  UpdateTechnicianInput,
} from './types';
import { createTechnicianSchema, updateTechnicianSchema } from './validators';
import type { TechnicianRemoteDatasource } from './remote-datasource';

export class TechnicianRepository {
  constructor(private readonly _remote: TechnicianRemoteDatasource) {}

  async getAll(
    tenantId: string,
    cursor?: string
  ): Promise<PaginatedResponse<Technician>> {
    return this._remote.fetchRemote(tenantId, cursor);
  }

  async getById(id: string): Promise<Technician> {
    return this._remote.getById(id);
  }

  async create(
    tenantId: string,
    input: CreateTechnicianInput
  ): Promise<Technician> {
    const validated = createTechnicianSchema.parse(input);
    return this._remote.create(tenantId, validated);
  }

  async update(
    id: string,
    tenantId: string,
    input: UpdateTechnicianInput
  ): Promise<Technician> {
    const validated = updateTechnicianSchema.parse(input);
    return this._remote.update(id, tenantId, validated);
  }

  async softDelete(id: string, tenantId: string): Promise<Technician> {
    return this._remote.softDelete(id, tenantId);
  }
}

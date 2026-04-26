import type {
  Supplier,
  PaginatedResponse,
  CreateSupplierInput,
  UpdateSupplierInput,
} from './types';
import { createSupplierSchema, updateSupplierSchema } from './validators';
import type { SupplierRemoteDatasource } from './remote-datasource';

export class SupplierRepository {
  constructor(private readonly _remote: SupplierRemoteDatasource) {}

  async getAll(
    tenantId: string,
    cursor?: string
  ): Promise<PaginatedResponse<Supplier>> {
    return this._remote.fetchRemote(tenantId, cursor);
  }

  async getById(id: string): Promise<Supplier> {
    return this._remote.getById(id);
  }

  async create(
    tenantId: string,
    input: CreateSupplierInput
  ): Promise<Supplier> {
    const validated = createSupplierSchema.parse(input);
    return this._remote.create(tenantId, validated);
  }

  async update(
    id: string,
    tenantId: string,
    input: UpdateSupplierInput
  ): Promise<Supplier> {
    const validated = updateSupplierSchema.parse(input);
    return this._remote.update(id, tenantId, validated);
  }

  async softDelete(id: string, tenantId: string): Promise<Supplier> {
    return this._remote.softDelete(id, tenantId);
  }
}

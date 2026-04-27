import type {
  Invoice,
  PaginatedResponse,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from './types';
import { createInvoiceSchema, updateInvoiceSchema } from './validators';
import type { InvoiceRemoteDatasource } from './remote-datasource';

export class InvoiceRepository {
  constructor(private readonly _remote: InvoiceRemoteDatasource) {}

  async getAll(
    tenantId: string,
    cursor?: string
  ): Promise<PaginatedResponse<Invoice>> {
    return this._remote.fetchRemote(tenantId, cursor);
  }

  async getById(id: string): Promise<Invoice> {
    return this._remote.getById(id);
  }

  async create(tenantId: string, input: CreateInvoiceInput): Promise<Invoice> {
    const validated = createInvoiceSchema.parse(input);
    return this._remote.create(tenantId, validated);
  }

  async update(
    id: string,
    tenantId: string,
    input: UpdateInvoiceInput
  ): Promise<Invoice> {
    const validated = updateInvoiceSchema.parse(input);
    return this._remote.update(id, tenantId, validated);
  }

  async softDelete(id: string, tenantId: string): Promise<Invoice> {
    return this._remote.softDelete(id, tenantId);
  }
}

import type {
  Product,
  PaginatedResponse,
  CreateProductInput,
  UpdateProductInput,
} from './types';
import { createProductSchema, updateProductSchema } from './validators';
import type { ProductRemoteDatasource } from './remote-datasource';

export class ProductRepository {
  constructor(private readonly _remote: ProductRemoteDatasource) {}

  async getAll(
    tenantId: string,
    cursor?: string
  ): Promise<PaginatedResponse<Product>> {
    return this._remote.fetchRemote(tenantId, cursor);
  }

  async getById(id: string): Promise<Product> {
    return this._remote.getById(id);
  }

  async create(tenantId: string, input: CreateProductInput): Promise<Product> {
    const validated = createProductSchema.parse(input);
    return this._remote.create(tenantId, validated);
  }

  async update(
    id: string,
    tenantId: string,
    input: UpdateProductInput
  ): Promise<Product> {
    const validated = updateProductSchema.parse(input);
    return this._remote.update(id, tenantId, validated);
  }

  async softDelete(id: string, tenantId: string): Promise<Product> {
    return this._remote.softDelete(id, tenantId);
  }
}

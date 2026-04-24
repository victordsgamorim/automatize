import type {
  Product,
  PaginatedResponse,
  CreateProductInput,
  UpdateProductInput,
} from './types';
import { productSchema } from './validators';

const MOCK_DATA_URL = '/mock-data/products.json';
const SIMULATED_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMockProducts(): Promise<Product[]> {
  try {
    const res = await fetch(MOCK_DATA_URL);
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return data as Product[];
  } catch {
    return [];
  }
}

export class ProductRemoteDatasource {
  private _cache: Product[] | null = null;

  private async getProducts(): Promise<Product[]> {
    if (this._cache) return this._cache;
    const products = await fetchMockProducts();
    this._cache = products;
    return products;
  }

  async fetchRemote(
    tenantId: string,
    cursor?: string
  ): Promise<PaginatedResponse<Product>> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getProducts();
    let filtered = all.filter(
      (p) => p.tenantId === tenantId && p.deletedAt === null
    );

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (cursor) {
      const idx = filtered.findIndex((p) => p.id === cursor);
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

  async getById(id: string): Promise<Product> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getProducts();
    const product = all.find((p) => p.id === id && p.deletedAt === null);
    if (!product) {
      throw new Error(`Product not found: ${id}`);
    }
    return productSchema.parse(product);
  }

  async create(tenantId: string, input: CreateProductInput): Promise<Product> {
    await delay(SIMULATED_DELAY_MS);
    const now = new Date().toISOString();
    const product: Product = {
      id: crypto.randomUUID(),
      tenantId,
      name: input.name,
      price: input.price,
      quantity: input.quantity,
      info: input.info,
      photoUrl: input.photoUrl,
      companyId: input.companyId,
      companyName: input.companyName,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    const validated = productSchema.parse(product);
    this._cache?.push(validated);
    return validated;
  }

  async update(
    id: string,
    tenantId: string,
    input: UpdateProductInput
  ): Promise<Product> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getProducts();
    const existing = all.find((p) => p.id === id && p.deletedAt === null);
    if (!existing) throw new Error(`Product not found: ${id}`);
    if (existing.tenantId !== tenantId)
      throw new Error(`Tenant mismatch for product: ${id}`);
    const updated: Product = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return productSchema.parse(updated);
  }

  async softDelete(id: string, tenantId: string): Promise<Product> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getProducts();
    const existing = all.find((p) => p.id === id && p.deletedAt === null);
    if (!existing) throw new Error(`Product not found: ${id}`);
    if (existing.tenantId !== tenantId)
      throw new Error(`Tenant mismatch for product: ${id}`);
    existing.deletedAt = new Date().toISOString();
    existing.updatedAt = new Date().toISOString();
    return productSchema.parse(existing);
  }
}

import type {
  Supplier,
  PaginatedResponse,
  CreateSupplierInput,
  UpdateSupplierInput,
} from './types';
import { supplierSchema } from './validators';

const MOCK_DATA_URL = '/mock-data/suppliers.json';
const SIMULATED_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMockSuppliers(): Promise<Supplier[]> {
  try {
    const res = await fetch(MOCK_DATA_URL);
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return data as Supplier[];
  } catch {
    return [];
  }
}

export class SupplierRemoteDatasource {
  private _cache: Supplier[] | null = null;

  private async getSuppliers(): Promise<Supplier[]> {
    if (this._cache) return this._cache;
    const suppliers = await fetchMockSuppliers();
    this._cache = suppliers;
    return suppliers;
  }

  async fetchRemote(
    tenantId: string,
    cursor?: string
  ): Promise<PaginatedResponse<Supplier>> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getSuppliers();
    let filtered = all.filter(
      (s) => s.tenantId === tenantId && s.deletedAt === null
    );

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (cursor) {
      const idx = filtered.findIndex((s) => s.id === cursor);
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

  async getById(id: string): Promise<Supplier> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getSuppliers();
    const supplier = all.find((s) => s.id === id && s.deletedAt === null);
    if (!supplier) {
      throw new Error(`Supplier not found: ${id}`);
    }
    return supplierSchema.parse(supplier);
  }

  async create(
    tenantId: string,
    input: CreateSupplierInput
  ): Promise<Supplier> {
    await delay(SIMULATED_DELAY_MS);
    const now = new Date().toISOString();
    const supplier: Supplier = {
      id: crypto.randomUUID(),
      tenantId,
      name: input.name,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    const validated = supplierSchema.parse(supplier);
    this._cache?.push(validated);
    return validated;
  }

  async update(
    id: string,
    tenantId: string,
    input: UpdateSupplierInput
  ): Promise<Supplier> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getSuppliers();
    const existing = all.find((s) => s.id === id && s.deletedAt === null);
    if (!existing) throw new Error(`Supplier not found: ${id}`);
    if (existing.tenantId !== tenantId)
      throw new Error(`Tenant mismatch for supplier: ${id}`);
    const updated: Supplier = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return supplierSchema.parse(updated);
  }

  async softDelete(id: string, tenantId: string): Promise<Supplier> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getSuppliers();
    const existing = all.find((s) => s.id === id && s.deletedAt === null);
    if (!existing) throw new Error(`Supplier not found: ${id}`);
    if (existing.tenantId !== tenantId)
      throw new Error(`Tenant mismatch for supplier: ${id}`);
    existing.deletedAt = new Date().toISOString();
    existing.updatedAt = new Date().toISOString();
    return supplierSchema.parse(existing);
  }
}

import type {
  Invoice,
  PaginatedResponse,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from './types';
import { invoiceSchema } from './validators';

const MOCK_DATA_URL = '/mock-data/invoices.json';
const SIMULATED_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMockInvoices(): Promise<Invoice[]> {
  try {
    const res = await fetch(MOCK_DATA_URL);
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return data as Invoice[];
  } catch {
    return [];
  }
}

export class InvoiceRemoteDatasource {
  private _cache: Invoice[] | null = null;

  private async getInvoices(): Promise<Invoice[]> {
    if (this._cache) return this._cache;
    const invoices = await fetchMockInvoices();
    this._cache = invoices;
    return invoices;
  }

  async fetchRemote(
    tenantId: string,
    cursor?: string
  ): Promise<PaginatedResponse<Invoice>> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getInvoices();
    let filtered = all.filter(
      (inv) => inv.tenantId === tenantId && inv.deletedAt === null
    );

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (cursor) {
      const idx = filtered.findIndex((inv) => inv.id === cursor);
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

  async getById(id: string): Promise<Invoice> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getInvoices();
    const invoice = all.find((inv) => inv.id === id && inv.deletedAt === null);
    if (!invoice) {
      throw new Error(`Invoice not found: ${id}`);
    }
    return invoiceSchema.parse(invoice);
  }

  async create(tenantId: string, input: CreateInvoiceInput): Promise<Invoice> {
    await delay(SIMULATED_DELAY_MS);
    const now = new Date().toISOString();
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      tenantId,
      clientId: input.clientId,
      clientName: input.clientName,
      date: input.date,
      warrantyMonths: input.warrantyMonths,
      total: input.total,
      additionalInfo: input.additionalInfo,
      clientAddresses: input.clientAddresses.map((a) => ({
        ...a,
        id: crypto.randomUUID(),
      })),
      clientPhones: input.clientPhones.map((p) => ({
        ...p,
        id: crypto.randomUUID(),
      })),
      products: input.products,
      technicians: input.technicians,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    const validated = invoiceSchema.parse(invoice);
    this._cache?.push(validated);
    return validated;
  }

  async update(
    id: string,
    tenantId: string,
    input: UpdateInvoiceInput
  ): Promise<Invoice> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getInvoices();
    const existing = all.find((inv) => inv.id === id && inv.deletedAt === null);
    if (!existing) throw new Error(`Invoice not found: ${id}`);
    if (existing.tenantId !== tenantId)
      throw new Error(`Tenant mismatch for invoice: ${id}`);
    const updated: Invoice = {
      ...existing,
      ...input,
      clientAddresses:
        input.clientAddresses?.map((a) => ({
          ...a,
          id: crypto.randomUUID(),
        })) ?? existing.clientAddresses,
      clientPhones:
        input.clientPhones?.map((p) => ({
          ...p,
          id: crypto.randomUUID(),
        })) ?? existing.clientPhones,
      updatedAt: new Date().toISOString(),
    };
    return invoiceSchema.parse(updated);
  }

  async softDelete(id: string, tenantId: string): Promise<Invoice> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getInvoices();
    const existing = all.find((inv) => inv.id === id && inv.deletedAt === null);
    if (!existing) throw new Error(`Invoice not found: ${id}`);
    if (existing.tenantId !== tenantId)
      throw new Error(`Tenant mismatch for invoice: ${id}`);
    existing.deletedAt = new Date().toISOString();
    existing.updatedAt = new Date().toISOString();
    return invoiceSchema.parse(existing);
  }
}

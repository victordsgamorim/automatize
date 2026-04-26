import type {
  Technician,
  PaginatedResponse,
  CreateTechnicianInput,
  UpdateTechnicianInput,
} from './types';
import { technicianSchema } from './validators';

const MOCK_DATA_URL = '/mock-data/technicians.json';
const SIMULATED_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMockTechnicians(): Promise<Technician[]> {
  try {
    const res = await fetch(MOCK_DATA_URL);
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return data as Technician[];
  } catch {
    return [];
  }
}

export class TechnicianRemoteDatasource {
  private _cache: Technician[] | null = null;

  private async getTechnicians(): Promise<Technician[]> {
    if (this._cache) return this._cache;
    const technicians = await fetchMockTechnicians();
    this._cache = technicians;
    return technicians;
  }

  async fetchRemote(
    tenantId: string,
    cursor?: string
  ): Promise<PaginatedResponse<Technician>> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getTechnicians();
    let filtered = all.filter(
      (t) => t.tenantId === tenantId && t.deletedAt === null
    );

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (cursor) {
      const idx = filtered.findIndex((t) => t.id === cursor);
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

  async getById(id: string): Promise<Technician> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getTechnicians();
    const technician = all.find((t) => t.id === id && t.deletedAt === null);
    if (!technician) {
      throw new Error(`Technician not found: ${id}`);
    }
    return technicianSchema.parse(technician);
  }

  async create(
    tenantId: string,
    input: CreateTechnicianInput
  ): Promise<Technician> {
    await delay(SIMULATED_DELAY_MS);
    const now = new Date().toISOString();
    const technician: Technician = {
      id: crypto.randomUUID(),
      tenantId,
      name: input.name,
      entryDate: input.entryDate,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    const validated = technicianSchema.parse(technician);
    this._cache?.push(validated);
    return validated;
  }

  async update(
    id: string,
    tenantId: string,
    input: UpdateTechnicianInput
  ): Promise<Technician> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getTechnicians();
    const existing = all.find((t) => t.id === id && t.deletedAt === null);
    if (!existing) throw new Error(`Technician not found: ${id}`);
    if (existing.tenantId !== tenantId)
      throw new Error(`Tenant mismatch for technician: ${id}`);
    const updated: Technician = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return technicianSchema.parse(updated);
  }

  async softDelete(id: string, tenantId: string): Promise<Technician> {
    await delay(SIMULATED_DELAY_MS);
    const all = await this.getTechnicians();
    const existing = all.find((t) => t.id === id && t.deletedAt === null);
    if (!existing) throw new Error(`Technician not found: ${id}`);
    if (existing.tenantId !== tenantId)
      throw new Error(`Tenant mismatch for technician: ${id}`);
    existing.deletedAt = new Date().toISOString();
    existing.updatedAt = new Date().toISOString();
    return technicianSchema.parse(existing);
  }
}

export interface Technician {
  id: string;
  tenantId: string;
  name: string;
  /** ISO date string — "YYYY-MM-DD" */
  entryDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateTechnicianInput {
  name: string;
  entryDate: string;
}

export interface UpdateTechnicianInput {
  name?: string;
  entryDate?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

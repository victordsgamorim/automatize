export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateSupplierInput {
  name: string;
}

export interface UpdateSupplierInput {
  name?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

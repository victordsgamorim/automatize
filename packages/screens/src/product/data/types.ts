export interface Product {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  quantity: number;
  info: string;
  photoUrl?: string;
  companyId?: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateProductInput {
  name: string;
  price: number;
  quantity: number;
  info: string;
  photoUrl?: string;
  companyId?: string;
  companyName?: string;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  quantity?: number;
  info?: string;
  photoUrl?: string;
  companyId?: string;
  companyName?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type ClientAddressType = 'residence' | 'establishment';
export type ClientPhoneType = 'mobile' | 'telephone';
export type ClientType = 'individual' | 'business';

export interface ClientAddress {
  id: string;
  addressType: ClientAddressType;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  info: string;
}

export interface ClientPhone {
  id: string;
  phoneType: ClientPhoneType;
  number: string;
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  clientType: ClientType;
  document: string;
  email: string;
  addresses: ClientAddress[];
  phones: ClientPhone[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateClientInput {
  name: string;
  clientType: ClientType;
  document: string;
  email: string;
  addresses: Omit<ClientAddress, 'id'>[];
  phones: Omit<ClientPhone, 'id'>[];
}

export interface UpdateClientInput {
  name?: string;
  clientType?: ClientType;
  document?: string;
  email?: string;
  addresses?: Omit<ClientAddress, 'id'>[];
  phones?: Omit<ClientPhone, 'id'>[];
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

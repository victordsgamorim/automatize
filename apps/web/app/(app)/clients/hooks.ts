'use client';

import { useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type {
  UseInfiniteQueryResult,
  UseQueryResult,
  QueryClient,
  InfiniteData,
} from '@tanstack/react-query';
import type { ClientRow } from '@automatize/screens/client/web';
import {
  ClientRemoteDatasource,
  ClientRepository,
} from '@automatize/screens/client/data';
import type {
  PaginatedResponse,
  Client,
} from '@automatize/screens/client/data';

import type { ClientFormData } from '@automatize/screens/client-form/web';

const CLIENTS_KEY = 'clients';
const CLIENT_KEY = 'client';
const DEFAULT_TENANT = '01JQF0NDEKTSV4RRFFQ69G5FA0';

const remote = new ClientRemoteDatasource();

function createRepo(): ClientRepository {
  return new ClientRepository(remote);
}

export interface ClientsQueryData {
  pages: PaginatedResponse<Client>[];
  pageParams: (string | undefined)[];
  clients: Client[];
}

export function toClientRow(client: Client): ClientRow {
  return {
    id: client.id,
    name: client.name,
    clientType: client.clientType,
    document: client.document,
    addresses: client.addresses.map((a) => ({
      id: a.id,
      addressType: a.addressType,
      street: a.street,
      number: a.number,
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
      info: a.info,
    })),
    phones: client.phones.map((p) => ({
      id: p.id,
      phoneType: p.phoneType,
      number: p.number,
    })),
  };
}

export function useClientsData(
  tenantId: string = DEFAULT_TENANT
): UseInfiniteQueryResult<ClientsQueryData, Error> {
  return useInfiniteQuery({
    queryKey: [CLIENTS_KEY, tenantId],
    queryFn: ({ pageParam }) => createRepo().getAll(tenantId, pageParam),
    getNextPageParam: (lastPage: PaginatedResponse<Client>) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    select: (data): ClientsQueryData => ({
      pages: data.pages,
      pageParams: data.pageParams,
      clients: data.pages.flatMap((page) => page.data),
    }),
  });
}

export function useClientsRows(tenantId: string = DEFAULT_TENANT): ClientRow[] {
  const { data } = useClientsData(tenantId);
  return useMemo(() => data?.clients.map(toClientRow) ?? [], [data]);
}

export function useClient(
  id: string,
  tenantId: string = DEFAULT_TENANT
): UseQueryResult<Client, Error> {
  return useQuery({
    queryKey: [CLIENT_KEY, id, tenantId],
    queryFn: () => createRepo().getById(id),
    enabled: !!id,
  });
}

type AddressLike = {
  id: string;
  addressType?: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  info?: string;
};
type PhoneLike = { id: string; phoneType?: string; number: string };

/** Add an address to a client directly in the React Query cache. */
export function addAddressToClientInCache(
  queryClient: QueryClient,
  clientId: string,
  address: AddressLike,
  tenantId: string = DEFAULT_TENANT
): void {
  queryClient.setQueryData<InfiniteData<PaginatedResponse<Client>>>(
    [CLIENTS_KEY, tenantId],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  addresses: [
                    ...c.addresses,
                    {
                      id: address.id,
                      addressType: (address.addressType ?? 'residence') as
                        | 'residence'
                        | 'establishment',
                      street: address.street,
                      number: address.number,
                      neighborhood: address.neighborhood,
                      city: address.city,
                      state: address.state,
                      info: address.info ?? '',
                    },
                  ],
                }
              : c
          ),
        })),
      };
    }
  );
}

/** Add a phone to a client directly in the React Query cache. */
export function addPhoneToClientInCache(
  queryClient: QueryClient,
  clientId: string,
  phone: PhoneLike,
  tenantId: string = DEFAULT_TENANT
): void {
  queryClient.setQueryData<InfiniteData<PaginatedResponse<Client>>>(
    [CLIENTS_KEY, tenantId],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  phones: [
                    ...c.phones,
                    {
                      id: phone.id,
                      phoneType: (phone.phoneType ?? 'mobile') as
                        | 'mobile'
                        | 'telephone',
                      number: phone.number,
                    },
                  ],
                }
              : c
          ),
        })),
      };
    }
  );
}

export function addClientToCache(
  queryClient: QueryClient,
  row: ClientRow,
  _formData: ClientFormData,
  tenantId: string = DEFAULT_TENANT
): void {
  const now = new Date().toISOString();
  const client: Client = {
    id: row.id,
    tenantId,
    name: row.name,
    clientType: row.clientType ?? 'individual',
    document: row.document ?? '',
    email: '',
    addresses: row.addresses.map((a) => ({
      id: a.id,
      addressType: a.addressType ?? 'residence',
      street: a.street,
      number: a.number,
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
      info: a.info ?? '',
    })),
    phones: row.phones.map((p) => ({
      id: p.id,
      phoneType: p.phoneType ?? 'mobile',
      number: p.number,
    })),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  queryClient.setQueryData<InfiniteData<PaginatedResponse<Client>>>(
    [CLIENTS_KEY, tenantId],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: [
          { ...old.pages[0], data: [client, ...old.pages[0].data] },
          ...old.pages.slice(1),
        ],
      };
    }
  );
}

export function updateClientInCache(
  queryClient: QueryClient,
  id: string,
  row: ClientRow,
  tenantId: string = DEFAULT_TENANT
): void {
  const now = new Date().toISOString();
  const client: Client = {
    id: row.id,
    tenantId,
    name: row.name,
    clientType: row.clientType ?? 'individual',
    document: row.document ?? '',
    email: '',
    addresses: row.addresses.map((a) => ({
      id: a.id,
      addressType: a.addressType ?? 'residence',
      street: a.street,
      number: a.number,
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
      info: a.info ?? '',
    })),
    phones: row.phones.map((p) => ({
      id: p.id,
      phoneType: p.phoneType ?? 'mobile',
      number: p.number,
    })),
    createdAt: '',
    updatedAt: now,
    deletedAt: null,
  };
  queryClient.setQueryData<InfiniteData<PaginatedResponse<Client>>>(
    [CLIENTS_KEY, tenantId],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((c) =>
            c.id === id ? { ...client, createdAt: c.createdAt } : c
          ),
        })),
      };
    }
  );
}

'use client';

import { useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type {
  UseInfiniteQueryResult,
  UseQueryResult,
} from '@tanstack/react-query';
import type { ClientRow } from '@automatize/screens/client/web';
import { ClientRemoteDatasource } from './remote-datasource';
import { ClientRepository } from './repository';
import type { PaginatedResponse, Client } from './types';

const CLIENTS_KEY = 'clients';
const CLIENT_KEY = 'client';
const DEFAULT_TENANT = '01JQF0NDEKTSV4RRFFQ69G5FA0';

const remote = new ClientRemoteDatasource();

function createRepo(): ClientRepository {
  return new ClientRepository(remote);
}

interface ClientsQueryData {
  pages: PaginatedResponse<Client>[];
  pageParams: (string | undefined)[];
  clients: Client[];
}

function toClientRow(client: Client): ClientRow {
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
    getNextPageParam: (lastPage) =>
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

'use client';

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type {
  UseInfiniteQueryResult,
  QueryClient,
  InfiniteData,
} from '@tanstack/react-query';
import { generateId } from '@automatize/utils';
import type { TechnicianRow } from '@automatize/screens/technician/web';
import {
  TechnicianRemoteDatasource,
  TechnicianRepository,
} from '@automatize/screens/technician/data';
import type {
  Technician,
  PaginatedResponse,
} from '@automatize/screens/technician/data';

const TECHNICIANS_KEY = 'technicians';
const DEFAULT_TENANT = '01JQF0NDEKTSV4RRFFQ69G5FA0';

const remote = new TechnicianRemoteDatasource();

function createRepo(): TechnicianRepository {
  return new TechnicianRepository(remote);
}

export interface TechniciansQueryData {
  pages: PaginatedResponse<Technician>[];
  pageParams: (string | undefined)[];
  technicians: Technician[];
}

export function toTechnicianRow(technician: Technician): TechnicianRow {
  return {
    id: technician.id,
    name: technician.name,
    entryDate: technician.entryDate,
  };
}

export function useTechniciansData(
  tenantId: string = DEFAULT_TENANT
): UseInfiniteQueryResult<TechniciansQueryData, Error> {
  return useInfiniteQuery({
    queryKey: [TECHNICIANS_KEY, tenantId],
    queryFn: ({ pageParam }) => createRepo().getAll(tenantId, pageParam),
    getNextPageParam: (lastPage: PaginatedResponse<Technician>) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    select: (data): TechniciansQueryData => ({
      pages: data.pages,
      pageParams: data.pageParams,
      technicians: data.pages.flatMap((page) => page.data),
    }),
  });
}

export function useTechniciansRows(
  tenantId: string = DEFAULT_TENANT
): TechnicianRow[] {
  const { data } = useTechniciansData(tenantId);
  return useMemo(() => data?.technicians.map(toTechnicianRow) ?? [], [data]);
}

export function addTechnicianToCache(
  queryClient: QueryClient,
  name: string,
  entryDate: string,
  tenantId: string = DEFAULT_TENANT
): void {
  const now = new Date().toISOString();
  const technician: Technician = {
    id: generateId(),
    tenantId,
    name,
    entryDate,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  queryClient.setQueryData<InfiniteData<PaginatedResponse<Technician>>>(
    [TECHNICIANS_KEY, tenantId],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: [
          { ...old.pages[0], data: [technician, ...old.pages[0].data] },
          ...old.pages.slice(1),
        ],
      };
    }
  );
}

export function updateTechnicianInCache(
  queryClient: QueryClient,
  id: string,
  name: string,
  entryDate: string,
  tenantId: string = DEFAULT_TENANT
): void {
  queryClient.setQueryData<InfiniteData<PaginatedResponse<Technician>>>(
    [TECHNICIANS_KEY, tenantId],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((t) =>
            t.id === id
              ? { ...t, name, entryDate, updatedAt: new Date().toISOString() }
              : t
          ),
        })),
      };
    }
  );
}

export function deleteTechnicianInCache(
  queryClient: QueryClient,
  id: string,
  tenantId: string = DEFAULT_TENANT
): void {
  queryClient.setQueryData<InfiniteData<PaginatedResponse<Technician>>>(
    [TECHNICIANS_KEY, tenantId],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.filter((t) => t.id !== id),
        })),
      };
    }
  );
}

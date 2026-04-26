'use client';

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
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

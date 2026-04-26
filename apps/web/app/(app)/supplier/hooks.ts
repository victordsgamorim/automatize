'use client';

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import type { SupplierRow } from '@automatize/screens/supplier/web';
import {
  SupplierRemoteDatasource,
  SupplierRepository,
} from '@automatize/screens/supplier/data';
import type {
  Supplier,
  PaginatedResponse,
} from '@automatize/screens/supplier/data';

const SUPPLIERS_KEY = 'suppliers';
const DEFAULT_TENANT = '01JQF0NDEKTSV4RRFFQ69G5FA0';

const remote = new SupplierRemoteDatasource();

function createRepo(): SupplierRepository {
  return new SupplierRepository(remote);
}

export interface SuppliersQueryData {
  pages: PaginatedResponse<Supplier>[];
  pageParams: (string | undefined)[];
  suppliers: Supplier[];
}

export function toSupplierRow(supplier: Supplier): SupplierRow {
  return {
    id: supplier.id,
    name: supplier.name,
  };
}

export function useSuppliersData(
  tenantId: string = DEFAULT_TENANT
): UseInfiniteQueryResult<SuppliersQueryData, Error> {
  return useInfiniteQuery({
    queryKey: [SUPPLIERS_KEY, tenantId],
    queryFn: ({ pageParam }) => createRepo().getAll(tenantId, pageParam),
    getNextPageParam: (lastPage: PaginatedResponse<Supplier>) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    select: (data): SuppliersQueryData => ({
      pages: data.pages,
      pageParams: data.pageParams,
      suppliers: data.pages.flatMap((page) => page.data),
    }),
  });
}

export function useSuppliersRows(
  tenantId: string = DEFAULT_TENANT
): SupplierRow[] {
  const { data } = useSuppliersData(tenantId);
  return useMemo(() => data?.suppliers.map(toSupplierRow) ?? [], [data]);
}

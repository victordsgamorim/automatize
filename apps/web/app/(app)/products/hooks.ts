'use client';

import { useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type {
  UseInfiniteQueryResult,
  UseQueryResult,
} from '@tanstack/react-query';
import type { ProductRow } from '@automatize/screens/product/web';
import {
  ProductRemoteDatasource,
  ProductRepository,
} from '@automatize/screens/product/data';
import type {
  PaginatedResponse,
  Product,
} from '@automatize/screens/product/data';

const PRODUCTS_KEY = 'products';
const PRODUCT_KEY = 'product';
const DEFAULT_TENANT = '01JQF0NDEKTSV4RRFFQ69G5FA0';

const remote = new ProductRemoteDatasource();

function createRepo(): ProductRepository {
  return new ProductRepository(remote);
}

export interface ProductsQueryData {
  pages: PaginatedResponse<Product>[];
  pageParams: (string | undefined)[];
  products: Product[];
}

export function toProductRow(product: Product): ProductRow {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    info: product.info || undefined,
    photo: product.photoUrl,
    companyId: product.companyId,
    companyName: product.companyName,
  };
}

export function useProductsData(
  tenantId: string = DEFAULT_TENANT
): UseInfiniteQueryResult<ProductsQueryData, Error> {
  return useInfiniteQuery({
    queryKey: [PRODUCTS_KEY, tenantId],
    queryFn: ({ pageParam }) => createRepo().getAll(tenantId, pageParam),
    getNextPageParam: (lastPage: PaginatedResponse<Product>) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    select: (data): ProductsQueryData => ({
      pages: data.pages,
      pageParams: data.pageParams,
      products: data.pages.flatMap((page) => page.data),
    }),
  });
}

export function useProductsRows(
  tenantId: string = DEFAULT_TENANT
): ProductRow[] {
  const { data } = useProductsData(tenantId);
  return useMemo(() => data?.products.map(toProductRow) ?? [], [data]);
}

export function useProduct(
  id: string,
  tenantId: string = DEFAULT_TENANT
): UseQueryResult<Product, Error> {
  return useQuery({
    queryKey: [PRODUCT_KEY, id, tenantId],
    queryFn: () => createRepo().getById(id),
    enabled: !!id,
  });
}

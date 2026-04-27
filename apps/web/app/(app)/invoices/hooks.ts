'use client';

import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type {
  UseInfiniteQueryResult,
  UseQueryResult,
} from '@tanstack/react-query';
import type { InvoiceRow } from '@automatize/screens/invoice/web';
import {
  InvoiceRemoteDatasource,
  InvoiceRepository,
} from '@automatize/screens/invoice/data';
import type {
  PaginatedResponse,
  Invoice,
} from '@automatize/screens/invoice/data';
import type { InvoiceFormData } from '@automatize/screens/invoice-form/web';

export const INVOICES_QUERY_KEY = 'invoices';
const INVOICE_QUERY_KEY = 'invoice';
const DEFAULT_TENANT = '01JQF0NDEKTSV4RRFFQ69G5FA0';

const remote = new InvoiceRemoteDatasource();

function createRepo(): InvoiceRepository {
  return new InvoiceRepository(remote);
}

export interface InvoicesQueryData {
  pages: PaginatedResponse<Invoice>[];
  pageParams: (string | undefined)[];
  invoices: Invoice[];
}

export function toInvoiceRow(invoice: Invoice): InvoiceRow {
  return {
    id: invoice.id,
    clientName: invoice.clientName,
    date: invoice.date,
    warrantyMonths: invoice.warrantyMonths,
    total: invoice.total,
    clientPhones: invoice.clientPhones,
    clientAddresses: invoice.clientAddresses,
    products: invoice.products.map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      totalPrice: p.totalPrice,
    })),
    technicians: invoice.technicians,
    additionalInfo: invoice.additionalInfo || undefined,
  };
}

export function invoiceToFormData(invoice: Invoice): InvoiceFormData {
  return {
    clientId: invoice.clientId,
    clientName: invoice.clientName,
    clientAddresses: invoice.clientAddresses.map((a) => ({
      id: a.id,
      addressType: a.addressType ?? 'residence',
      street: a.street,
      number: a.number,
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
      info: a.info ?? '',
    })),
    clientPhones: invoice.clientPhones.map((p) => ({
      id: p.id,
      phoneType: p.phoneType ?? 'mobile',
      number: p.number,
    })),
    products: invoice.products.map((p) => ({
      id: p.id,
      productId: p.productId,
      name: p.name,
      unitPrice: p.unitPrice,
      quantity: p.quantity,
      availableStock: p.quantity,
      totalPrice: p.totalPrice,
    })),
    technicians: invoice.technicians.map((t) => ({
      id: t.id,
      name: t.name,
      active: true,
    })),
    warrantyMonths: invoice.warrantyMonths,
    additionalInfo: invoice.additionalInfo,
    total: invoice.total,
  };
}

export function useInvoicesData(
  tenantId: string = DEFAULT_TENANT
): UseInfiniteQueryResult<InvoicesQueryData, Error> {
  return useInfiniteQuery({
    queryKey: [INVOICES_QUERY_KEY, tenantId],
    queryFn: ({ pageParam }) => createRepo().getAll(tenantId, pageParam),
    getNextPageParam: (lastPage: PaginatedResponse<Invoice>) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    select: (data): InvoicesQueryData => ({
      pages: data.pages,
      pageParams: data.pageParams,
      invoices: data.pages.flatMap((page) => page.data),
    }),
  });
}

export function useInvoicesRows(
  tenantId: string = DEFAULT_TENANT
): InvoiceRow[] {
  const { data } = useInvoicesData(tenantId);
  return useMemo(() => data?.invoices.map(toInvoiceRow) ?? [], [data]);
}

export function useInvoice(
  id: string,
  tenantId: string = DEFAULT_TENANT
): UseQueryResult<Invoice, Error> {
  return useQuery({
    queryKey: [INVOICE_QUERY_KEY, id, tenantId],
    queryFn: () => createRepo().getById(id),
    enabled: !!id,
  });
}

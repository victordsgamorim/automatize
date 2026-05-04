import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import type { AnalyticsScreenProps } from '../AnalyticsScreen.types';
import type { InvoiceRow } from '../../invoice/InvoiceScreen.types';
import type { InvoiceFormData } from '../../invoice-form/InvoiceFormScreen.types';

function makeProps(
  overrides: Partial<AnalyticsScreenProps> = {}
): AnalyticsScreenProps {
  return {
    invoices: [],
    invoiceDetails: new Map(),
    clients: [],
    products: [],
    ...overrides,
  };
}

function invoice(id: string, date: string, total: number): InvoiceRow {
  return { id, clientName: 'C', date, warrantyMonths: 0, total };
}

function makeInvoiceDetails(
  invoices: InvoiceRow[],
  productsPerInvoice: Record<
    string,
    { productId: string; quantity: number }[]
  > = {}
): Map<string, InvoiceFormData> {
  const map = new Map<string, InvoiceFormData>();
  for (const inv of invoices) {
    const prods = productsPerInvoice[inv.id] ?? [];
    map.set(inv.id, {
      clientId: inv.id === 'none' ? undefined : `client-${inv.id}`,
      clientName: inv.clientName,
      clientAddresses: [],
      clientPhones: [],
      products: prods.map((p) => ({
        id: `item-${p.productId}`,
        productId: p.productId,
        name: `Product ${p.productId}`,
        unitPrice: 10,
        quantity: p.quantity,
        availableStock: p.quantity,
        totalPrice: 10 * p.quantity,
      })),
      technicians: [],
      warrantyMonths: 0,
      additionalInfo: '',
      total: inv.total,
    });
  }
  return map;
}

describe('useAnalyticsData — MoM deltas', () => {
  it('returns null deltas when there are no invoices', () => {
    const { result } = renderHook(() => useAnalyticsData(makeProps()));
    expect(result.current.revenueDeltaPct).toBeNull();
    expect(result.current.invoicesDeltaPct).toBeNull();
    expect(result.current.avgInvoiceDeltaPct).toBeNull();
    expect(result.current.uniqueClientsDeltaPct).toBeNull();
    expect(result.current.productsSoldDeltaPct).toBeNull();
  });

  it('returns null deltas when only one month of data exists', () => {
    const { result } = renderHook(() =>
      useAnalyticsData(
        makeProps({
          invoices: [
            invoice('a', '2024-03-01', 100),
            invoice('b', '2024-03-15', 200),
          ],
        })
      )
    );
    expect(result.current.revenueDeltaPct).toBeNull();
    expect(result.current.invoicesDeltaPct).toBeNull();
    expect(result.current.avgInvoiceDeltaPct).toBeNull();
    expect(result.current.uniqueClientsDeltaPct).toBeNull();
    expect(result.current.productsSoldDeltaPct).toBeNull();
  });

  it('computes positive revenue delta from two months', () => {
    const { result } = renderHook(() =>
      useAnalyticsData(
        makeProps({
          invoices: [
            invoice('a', '2024-02-10', 1000),
            invoice('b', '2024-03-10', 1500),
          ],
        })
      )
    );
    expect(result.current.revenueDeltaPct).toBeCloseTo(0.5, 5);
  });

  it('computes negative revenue delta', () => {
    const { result } = renderHook(() =>
      useAnalyticsData(
        makeProps({
          invoices: [
            invoice('a', '2024-02-01', 2000),
            invoice('b', '2024-03-01', 1000),
          ],
        })
      )
    );
    expect(result.current.revenueDeltaPct).toBeCloseTo(-0.5, 5);
  });

  it('returns null delta when previous-month revenue is zero', () => {
    const { result } = renderHook(() =>
      useAnalyticsData(
        makeProps({
          invoices: [
            invoice('a', '2024-02-01', 0),
            invoice('b', '2024-03-01', 1000),
          ],
        })
      )
    );
    expect(result.current.revenueDeltaPct).toBeNull();
    expect(result.current.invoicesDeltaPct).toBe(0);
  });

  it('uses the last two consecutive months even when older data exists', () => {
    const { result } = renderHook(() =>
      useAnalyticsData(
        makeProps({
          invoices: [
            invoice('a', '2024-01-01', 500),
            invoice('b', '2024-02-01', 1000),
            invoice('c', '2024-03-01', 1500),
          ],
        })
      )
    );
    expect(result.current.revenueDeltaPct).toBeCloseTo(0.5, 5);
  });

  it('computes invoices count delta', () => {
    const { result } = renderHook(() =>
      useAnalyticsData(
        makeProps({
          invoices: [
            invoice('a', '2024-02-01', 100),
            invoice('b', '2024-02-15', 100),
            invoice('c', '2024-03-01', 100),
            invoice('d', '2024-03-10', 100),
            invoice('e', '2024-03-20', 100),
          ],
        })
      )
    );
    expect(result.current.invoicesDeltaPct).toBeCloseTo(0.5, 5);
  });

  it('computes avg invoice value delta', () => {
    const { result } = renderHook(() =>
      useAnalyticsData(
        makeProps({
          invoices: [
            invoice('a', '2024-02-01', 100),
            invoice('b', '2024-02-15', 200),
            invoice('c', '2024-03-01', 300),
          ],
        })
      )
    );
    expect(result.current.avgInvoiceDeltaPct).toBeCloseTo(1.0, 5);
  });
});

describe('useAnalyticsData — invoice-derived KPIs', () => {
  it('computes uniqueClientsInvoiced from invoices', () => {
    const invs = [
      {
        id: '1',
        clientName: 'A',
        clientId: 'c1',
        date: '2024-01-01',
        warrantyMonths: 0,
        total: 100,
      },
      {
        id: '2',
        clientName: 'B',
        clientId: 'c2',
        date: '2024-01-02',
        warrantyMonths: 0,
        total: 200,
      },
      {
        id: '3',
        clientName: 'A',
        clientId: 'c1',
        date: '2024-01-03',
        warrantyMonths: 0,
        total: 150,
      },
    ] as InvoiceRow[];
    const { result } = renderHook(() =>
      useAnalyticsData(makeProps({ invoices: invs }))
    );
    expect(result.current.uniqueClientsInvoiced).toBe(2);
  });

  it('computes totalProductsSold from invoiceDetails', () => {
    const invs = [
      invoice('a', '2024-01-01', 100),
      invoice('b', '2024-01-02', 200),
    ];
    const details = makeInvoiceDetails(invs, {
      a: [
        { productId: 'p1', quantity: 3 },
        { productId: 'p2', quantity: 2 },
      ],
      b: [{ productId: 'p1', quantity: 5 }],
    });
    const { result } = renderHook(() =>
      useAnalyticsData(makeProps({ invoices: invs, invoiceDetails: details }))
    );
    expect(result.current.totalProductsSold).toBe(10);
  });

  it('computes topClientBySpending — picks client with highest total across all invoices', () => {
    const invs = [
      {
        id: '1',
        clientName: 'Alice',
        clientId: 'c1',
        date: '2024-01-15',
        warrantyMonths: 0,
        total: 500,
      },
      {
        id: '2',
        clientName: 'Alice',
        clientId: 'c1',
        date: '2024-01-20',
        warrantyMonths: 0,
        total: 800,
      },
      {
        id: '3',
        clientName: 'Bob',
        clientId: 'c2',
        date: '2024-02-01',
        warrantyMonths: 0,
        total: 1000,
      },
    ] as InvoiceRow[];
    const { result } = renderHook(() =>
      useAnalyticsData(makeProps({ invoices: invs }))
    );
    expect(result.current.topClientBySpending).toEqual({
      name: 'Alice',
      total: 1300,
    });
  });

  it('returns null topClientBySpending when no invoices', () => {
    const { result } = renderHook(() => useAnalyticsData(makeProps()));
    expect(result.current.topClientBySpending).toBeNull();
  });

  it('computes productsSoldDeltaPct from two months', () => {
    const invs = [
      invoice('a', '2024-02-01', 100),
      invoice('b', '2024-03-01', 200),
    ];
    const details = makeInvoiceDetails(invs, {
      a: [{ productId: 'p1', quantity: 10 }],
      b: [{ productId: 'p1', quantity: 15 }],
    });
    const { result } = renderHook(() =>
      useAnalyticsData(makeProps({ invoices: invs, invoiceDetails: details }))
    );
    expect(result.current.productsSoldDeltaPct).toBeCloseTo(0.5, 5);
  });

  it('returns null productsSoldDeltaPct when previous month sold zero', () => {
    const invs = [
      invoice('a', '2024-02-01', 100),
      invoice('b', '2024-03-01', 200),
    ];
    const details = makeInvoiceDetails(invs, {
      a: [],
      b: [{ productId: 'p1', quantity: 5 }],
    });
    const { result } = renderHook(() =>
      useAnalyticsData(makeProps({ invoices: invs, invoiceDetails: details }))
    );
    expect(result.current.productsSoldDeltaPct).toBeNull();
  });

  it('computes uniqueClientsDeltaPct from two months', () => {
    const invs = [
      {
        id: '1',
        clientId: 'c1',
        clientName: 'A',
        date: '2024-02-01',
        warrantyMonths: 0,
        total: 100,
      },
      {
        id: '2',
        clientId: 'c2',
        clientName: 'B',
        date: '2024-02-15',
        warrantyMonths: 0,
        total: 200,
      },
      {
        id: '3',
        clientId: 'c1',
        clientName: 'A',
        date: '2024-03-01',
        warrantyMonths: 0,
        total: 150,
      },
      {
        id: '4',
        clientId: 'c3',
        clientName: 'C',
        date: '2024-03-10',
        warrantyMonths: 0,
        total: 300,
      },
      {
        id: '5',
        clientId: 'c4',
        clientName: 'D',
        date: '2024-03-20',
        warrantyMonths: 0,
        total: 250,
      },
    ] as InvoiceRow[];
    const { result } = renderHook(() =>
      useAnalyticsData(makeProps({ invoices: invs }))
    );
    expect(result.current.uniqueClientsDeltaPct).toBeCloseTo(0.5, 5);
  });
});

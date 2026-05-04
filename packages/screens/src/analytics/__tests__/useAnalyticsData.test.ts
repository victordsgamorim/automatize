import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import type { AnalyticsScreenProps } from '../AnalyticsScreen.types';
import type { InvoiceRow } from '../../invoice/InvoiceScreen.types';

function makeProps(
  overrides: Partial<AnalyticsScreenProps> = {}
): AnalyticsScreenProps {
  return {
    invoices: [],
    invoiceDetails: new Map(),
    clients: [],
    products: [],
    technicians: [],
    ...overrides,
  };
}

function invoice(id: string, date: string, total: number): InvoiceRow {
  return { id, clientName: 'C', date, warrantyMonths: 0, total };
}

describe('useAnalyticsData — MoM deltas', () => {
  it('returns null deltas when there are no invoices', () => {
    const { result } = renderHook(() => useAnalyticsData(makeProps()));
    expect(result.current.revenueDeltaPct).toBeNull();
    expect(result.current.invoicesDeltaPct).toBeNull();
    expect(result.current.avgInvoiceDeltaPct).toBeNull();
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
    // 1500 vs 1000 → +50%
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
    // 1000 vs 2000 → -50%
    expect(result.current.revenueDeltaPct).toBeCloseTo(-0.5, 5);
  });

  it('returns null delta when previous-month revenue is zero', () => {
    // Two months but the prev month only has 0-total invoices
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
    // invoices count delta still feasible — Feb=1, Mar=1 → 0%
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
    // Mar (1500) vs Feb (1000) → +50%
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
    // Feb=2, Mar=3 → +50%
    expect(result.current.invoicesDeltaPct).toBeCloseTo(0.5, 5);
  });

  it('computes avg invoice value delta', () => {
    const { result } = renderHook(() =>
      useAnalyticsData(
        makeProps({
          invoices: [
            // Feb avg: (100+200)/2 = 150
            invoice('a', '2024-02-01', 100),
            invoice('b', '2024-02-15', 200),
            // Mar avg: (300)/1 = 300
            invoice('c', '2024-03-01', 300),
          ],
        })
      )
    );
    // 300 vs 150 → +100%
    expect(result.current.avgInvoiceDeltaPct).toBeCloseTo(1.0, 5);
  });
});

import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import type { AnalyticsScreenProps } from '../AnalyticsScreen.types';

export interface MonthRevenuePoint {
  month: string;
  revenue: number;
}

export interface MonthCountPoint {
  month: string;
  count: number;
}

export interface NameValueItem {
  name: string;
  value: number;
}

export interface ClientTypeItem {
  type: string;
  count: number;
}

export interface TechnicianWorkloadItem {
  name: string;
  count: number;
}

export interface LowStockItem {
  name: string;
  quantity: number;
  companyName?: string;
}

export interface TopClientSpending {
  name: string;
  total: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalInvoices: number;
  avgInvoiceValue: number;
  uniqueClientsInvoiced: number;
  totalProductsSold: number;
  topClientBySpending: TopClientSpending | null;
  revenueDeltaPct: number | null;
  invoicesDeltaPct: number | null;
  avgInvoiceDeltaPct: number | null;
  uniqueClientsDeltaPct: number | null;
  productsSoldDeltaPct: number | null;
  revenueByMonth: MonthRevenuePoint[];
  invoicesByMonth: MonthCountPoint[];
  clientTypeDistribution: ClientTypeItem[];
  topClientsByRevenue: NameValueItem[];
  topProductsByRevenue: NameValueItem[];
  topProductsByQuantity: NameValueItem[];
  technicianWorkload: TechnicianWorkloadItem[];
  lowStockProducts: LowStockItem[];
}

const LOW_STOCK_THRESHOLD = 5;
const TOP_N = 5;

export function useAnalyticsData({
  invoices,
  invoiceDetails,
  clients,
  products,
}: AnalyticsScreenProps): AnalyticsData {
  return useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalInvoices = invoices.length;
    const avgInvoiceValue =
      totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    const uniqueClientIds = new Set<string>();
    for (const inv of invoices) {
      if (inv.clientId) uniqueClientIds.add(inv.clientId);
    }
    const uniqueClientsInvoiced = uniqueClientIds.size;

    let totalProductsSold = 0;
    const clientSpendMap = new Map<string, { name: string; total: number }>();
    for (const inv of invoices) {
      if (inv.clientId) {
        const existing = clientSpendMap.get(inv.clientId) ?? {
          name: inv.clientName,
          total: 0,
        };
        clientSpendMap.set(inv.clientId, {
          name: existing.name,
          total: existing.total + inv.total,
        });
      }
      const detail = invoiceDetails.get(inv.id);
      if (detail) {
        for (const product of detail.products) {
          totalProductsSold += product.quantity;
        }
      }
    }
    const topClientBySpending =
      invoices.length > 0
        ? ([...clientSpendMap.values()].sort((a, b) => b.total - a.total)[0] ??
          null)
        : null;

    // ── Monthly time series ────────────────────────────────────────────────────
    const monthMap = new Map<
      string,
      {
        revenue: number;
        count: number;
        clientIds: Set<string>;
        productsSold: number;
      }
    >();
    for (const inv of invoices) {
      const key = inv.date.slice(0, 7);
      const existing = monthMap.get(key) ?? {
        revenue: 0,
        count: 0,
        clientIds: new Set<string>(),
        productsSold: 0,
      };
      if (inv.clientId) existing.clientIds.add(inv.clientId);
      const detail = invoiceDetails.get(inv.id);
      const sold = detail
        ? detail.products.reduce((s, p) => s + p.quantity, 0)
        : 0;
      monthMap.set(key, {
        revenue: existing.revenue + inv.total,
        count: existing.count + 1,
        clientIds: existing.clientIds,
        productsSold: existing.productsSold + sold,
      });
    }
    const sortedEntries = [...monthMap.entries()].sort(([a], [b]) =>
      a.localeCompare(b)
    );
    const revenueByMonth: MonthRevenuePoint[] = sortedEntries.map(
      ([key, { revenue }]) => ({
        month: format(parseISO(`${key}-01`), 'MMM/yy'),
        revenue,
      })
    );
    const invoicesByMonth: MonthCountPoint[] = sortedEntries.map(
      ([key, { count }]) => ({
        month: format(parseISO(`${key}-01`), 'MMM/yy'),
        count,
      })
    );

    // ── MoM deltas (last two months only) ──────────────────────────────────────
    let revenueDeltaPct: number | null = null;
    let invoicesDeltaPct: number | null = null;
    let avgInvoiceDeltaPct: number | null = null;
    let uniqueClientsDeltaPct: number | null = null;
    let productsSoldDeltaPct: number | null = null;
    if (sortedEntries.length >= 2) {
      const prev = sortedEntries[sortedEntries.length - 2][1];
      const curr = sortedEntries[sortedEntries.length - 1][1];
      revenueDeltaPct =
        prev.revenue === 0
          ? null
          : (curr.revenue - prev.revenue) / prev.revenue;
      invoicesDeltaPct =
        prev.count === 0 ? null : (curr.count - prev.count) / prev.count;
      const prevAvg = prev.count === 0 ? 0 : prev.revenue / prev.count;
      const currAvg = curr.count === 0 ? 0 : curr.revenue / curr.count;
      avgInvoiceDeltaPct = prevAvg === 0 ? null : (currAvg - prevAvg) / prevAvg;
      const prevClients = prev.clientIds.size;
      const currClients = curr.clientIds.size;
      uniqueClientsDeltaPct =
        prevClients === 0 ? null : (currClients - prevClients) / prevClients;
      productsSoldDeltaPct =
        prev.productsSold === 0
          ? null
          : (curr.productsSold - prev.productsSold) / prev.productsSold;
    }

    // ── Client type distribution (still needs clients prop for type info) ──────
    const individualClients = clients.filter(
      (c) => c.clientType === 'individual'
    ).length;
    const businessClients = clients.filter(
      (c) => c.clientType === 'business'
    ).length;
    const clientTypeDistribution: ClientTypeItem[] = [
      { type: 'individual', count: individualClients },
      { type: 'business', count: businessClients },
    ].filter((d) => d.count > 0);

    // ── Top clients by revenue (from invoiceDetails) ───────────────────────────
    const clientRevMap = new Map<string, { name: string; value: number }>();
    for (const formData of invoiceDetails.values()) {
      if (!formData.clientId || !formData.clientName) continue;
      const existing = clientRevMap.get(formData.clientId) ?? {
        name: formData.clientName,
        value: 0,
      };
      clientRevMap.set(formData.clientId, {
        name: existing.name,
        value: existing.value + formData.total,
      });
    }
    const topClientsByRevenue: NameValueItem[] = [...clientRevMap.values()]
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP_N);

    // ── Top products (from invoiceDetails) ────────────────────────────────────
    const productMap = new Map<
      string,
      { name: string; revenue: number; quantity: number }
    >();
    for (const formData of invoiceDetails.values()) {
      for (const product of formData.products) {
        const existing = productMap.get(product.productId) ?? {
          name: product.name,
          revenue: 0,
          quantity: 0,
        };
        productMap.set(product.productId, {
          name: existing.name,
          revenue: existing.revenue + product.totalPrice,
          quantity: existing.quantity + product.quantity,
        });
      }
    }
    const allSoldProducts = [...productMap.values()];
    const topProductsByRevenue: NameValueItem[] = [...allSoldProducts]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, TOP_N)
      .map(({ name, revenue }) => ({ name, value: revenue }));
    const topProductsByQuantity: NameValueItem[] = [...allSoldProducts]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, TOP_N)
      .map(({ name, quantity }) => ({ name, value: quantity }));

    // ── Technician workload (from invoiceDetails) ──────────────────────────────
    const techMap = new Map<string, { name: string; count: number }>();
    for (const formData of invoiceDetails.values()) {
      for (const tech of formData.technicians) {
        if (!tech.active) continue;
        const existing = techMap.get(tech.id) ?? {
          name: tech.name,
          count: 0,
        };
        techMap.set(tech.id, {
          name: existing.name,
          count: existing.count + 1,
        });
      }
    }
    const technicianWorkload: TechnicianWorkloadItem[] = [
      ...techMap.values(),
    ].sort((a, b) => b.count - a.count);

    // ── Low stock products ─────────────────────────────────────────────────────
    const lowStockProducts: LowStockItem[] = products
      .filter((p) => p.quantity < LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.quantity - b.quantity)
      .map((p) => ({
        name: p.name,
        quantity: p.quantity,
        companyName: p.companyName,
      }));

    return {
      totalRevenue,
      totalInvoices,
      avgInvoiceValue,
      uniqueClientsInvoiced,
      totalProductsSold,
      topClientBySpending,
      revenueDeltaPct,
      invoicesDeltaPct,
      avgInvoiceDeltaPct,
      uniqueClientsDeltaPct,
      productsSoldDeltaPct,
      revenueByMonth,
      invoicesByMonth,
      clientTypeDistribution,
      topClientsByRevenue,
      topProductsByRevenue,
      topProductsByQuantity,
      technicianWorkload,
      lowStockProducts,
    };
  }, [invoices, invoiceDetails, clients, products]);
}

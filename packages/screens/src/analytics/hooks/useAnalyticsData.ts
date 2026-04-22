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

export interface AnalyticsData {
  // KPIs
  totalRevenue: number;
  totalInvoices: number;
  avgInvoiceValue: number;
  totalClients: number;
  individualClients: number;
  businessClients: number;
  totalProducts: number;
  inventoryValue: number;
  activeTechnicians: number;
  // Time series
  revenueByMonth: MonthRevenuePoint[];
  invoicesByMonth: MonthCountPoint[];
  // Rankings
  topClientsByRevenue: NameValueItem[];
  topProductsByRevenue: NameValueItem[];
  topProductsByQuantity: NameValueItem[];
  // Distribution
  clientTypeDistribution: ClientTypeItem[];
  // Workload
  technicianWorkload: TechnicianWorkloadItem[];
  // Alerts
  lowStockProducts: LowStockItem[];
}

const LOW_STOCK_THRESHOLD = 5;
const TOP_N = 5;

export function useAnalyticsData({
  invoices,
  invoiceDetails,
  clients,
  products,
  technicians,
}: AnalyticsScreenProps): AnalyticsData {
  return useMemo(() => {
    // ── KPIs ───────────────────────────────────────────────────────────────────
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalInvoices = invoices.length;
    const avgInvoiceValue =
      totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    const individualClients = clients.filter(
      (c) => c.clientType === 'individual'
    ).length;
    const businessClients = clients.filter(
      (c) => c.clientType === 'business'
    ).length;
    const inventoryValue = products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );

    // ── Monthly time series ────────────────────────────────────────────────────
    const monthMap = new Map<string, { revenue: number; count: number }>();
    for (const inv of invoices) {
      const key = inv.date.slice(0, 7); // 'YYYY-MM'
      const existing = monthMap.get(key) ?? { revenue: 0, count: 0 };
      monthMap.set(key, {
        revenue: existing.revenue + inv.total,
        count: existing.count + 1,
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

    // ── Client type distribution ───────────────────────────────────────────────
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
      totalClients: clients.length,
      individualClients,
      businessClients,
      totalProducts: products.length,
      inventoryValue,
      activeTechnicians: technicians.length,
      revenueByMonth,
      invoicesByMonth,
      clientTypeDistribution,
      topClientsByRevenue,
      topProductsByRevenue,
      topProductsByQuantity,
      technicianWorkload,
      lowStockProducts,
    };
  }, [invoices, invoiceDetails, clients, products, technicians]);
}

import React from 'react';
import {
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  Package,
  Wrench,
} from 'lucide-react';
import { Card, Text } from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { KpiCard } from './components/KpiCard.web';
import { KpiSparkline } from './components/KpiSparkline.web';
import { RevenueChart } from './components/RevenueChart.web';
import { InvoicesChart } from './components/InvoicesChart.web';
import { ClientTypeChart } from './components/ClientTypeChart.web';
import { HorizontalBarChart } from './components/HorizontalBarChart.web';
import { TechnicianWorkloadChart } from './components/TechnicianWorkloadChart.web';
import { LowStockList } from './components/LowStockList.web';
import type { AnalyticsScreenProps } from './AnalyticsScreen.types';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return formatPrice(value);
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <Card padding="md" elevation={1}>
    <Text
      variant="label"
      className="mb-4 block text-sm font-semibold text-foreground"
    >
      {title}
    </Text>
    {children}
  </Card>
);

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  invoices,
  invoiceDetails,
  clients,
  products,
  technicians,
}) => {
  const { t } = useTranslation();

  const data = useAnalyticsData({
    invoices,
    invoiceDetails,
    clients,
    products,
    technicians,
  });

  const typeLabels: Record<string, string> = {
    individual: t('analytics.chart.clientType.individual'),
    business: t('analytics.chart.clientType.business'),
  };

  const noData = t('analytics.chart.noData');
  const trendLabel = t('analytics.trend.vsLastMonth');

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      {/* ── KPI Cards (bento grid) ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        {/* Hero: Total Revenue */}
        <div className="sm:col-span-2 lg:col-span-6">
          <KpiCard
            size="hero"
            accent="primary"
            icon={<DollarSign className="size-6" />}
            title={t('analytics.kpi.totalRevenue')}
            value={formatPrice(data.totalRevenue)}
            description={`${data.totalInvoices} ${t('analytics.kpi.totalRevenue.invoices')}`}
            trend={
              data.revenueDeltaPct !== null
                ? { pct: data.revenueDeltaPct, label: trendLabel }
                : undefined
            }
          >
            <KpiSparkline data={data.revenueByMonth} />
          </KpiCard>
        </div>

        {/* Rich: Total Clients */}
        <div className="lg:col-span-3">
          <KpiCard
            size="default"
            accent="info"
            icon={<Users className="size-5" />}
            title={t('analytics.kpi.totalClients')}
            value={String(data.totalClients)}
            description={t('analytics.kpi.totalClients.breakdown', {
              individual: String(data.individualClients),
              business: String(data.businessClients),
            })}
          />
        </div>

        {/* Rich: Total Products */}
        <div className="lg:col-span-3">
          <KpiCard
            size="default"
            accent="success"
            icon={<Package className="size-5" />}
            title={t('analytics.kpi.totalProducts')}
            value={String(data.totalProducts)}
            description={t('analytics.kpi.totalProducts.inventoryValue', {
              value: formatCompact(data.inventoryValue),
            })}
          />
        </div>

        {/* Compact: Total Invoices */}
        <div className="lg:col-span-4">
          <KpiCard
            size="compact"
            accent="primary"
            icon={<FileText className="size-5" />}
            title={t('analytics.kpi.totalInvoices')}
            value={String(data.totalInvoices)}
            trend={
              data.invoicesDeltaPct !== null
                ? { pct: data.invoicesDeltaPct, label: trendLabel }
                : undefined
            }
          />
        </div>

        {/* Compact: Avg Invoice Value */}
        <div className="lg:col-span-4">
          <KpiCard
            size="compact"
            accent="info"
            icon={<TrendingUp className="size-5" />}
            title={t('analytics.kpi.avgInvoiceValue')}
            value={formatPrice(data.avgInvoiceValue)}
            trend={
              data.avgInvoiceDeltaPct !== null
                ? { pct: data.avgInvoiceDeltaPct, label: trendLabel }
                : undefined
            }
          />
        </div>

        {/* Compact: Active Technicians */}
        <div className="sm:col-span-2 lg:col-span-4">
          <KpiCard
            size="compact"
            accent="warning"
            icon={<Wrench className="size-5" />}
            title={t('analytics.kpi.activeTechnicians')}
            value={String(data.activeTechnicians)}
          />
        </div>
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue Over Time */}
        <ChartCard title={t('analytics.chart.revenueOverTime')}>
          <RevenueChart
            data={data.revenueByMonth}
            formatValue={formatPrice}
            noDataLabel={noData}
            tooltipLabel={t('analytics.chart.revenue')}
          />
        </ChartCard>

        {/* Invoices Over Time */}
        <ChartCard title={t('analytics.chart.invoicesOverTime')}>
          <InvoicesChart
            data={data.invoicesByMonth}
            noDataLabel={noData}
            tooltipLabel={t('analytics.chart.invoices')}
          />
        </ChartCard>

        {/* Client Type Distribution */}
        <ChartCard title={t('analytics.chart.clientTypeDistribution')}>
          <ClientTypeChart
            data={data.clientTypeDistribution}
            typeLabels={typeLabels}
            noDataLabel={noData}
          />
        </ChartCard>

        {/* Top Clients by Revenue */}
        <ChartCard title={t('analytics.chart.topClientsByRevenue')}>
          <HorizontalBarChart
            data={data.topClientsByRevenue}
            noDataLabel={noData}
            formatValue={formatPrice}
            tooltipLabel={t('analytics.chart.revenue')}
          />
        </ChartCard>

        {/* Top Products by Revenue */}
        <ChartCard title={t('analytics.chart.topProductsByRevenue')}>
          <HorizontalBarChart
            data={data.topProductsByRevenue}
            noDataLabel={noData}
            formatValue={formatPrice}
            tooltipLabel={t('analytics.chart.revenue')}
          />
        </ChartCard>

        {/* Top Products by Quantity */}
        <ChartCard title={t('analytics.chart.topProductsByQuantity')}>
          <HorizontalBarChart
            data={data.topProductsByQuantity}
            noDataLabel={noData}
            tooltipLabel={t('analytics.chart.quantity')}
          />
        </ChartCard>

        {/* Technician Workload */}
        <ChartCard title={t('analytics.chart.technicianWorkload')}>
          <TechnicianWorkloadChart
            data={data.technicianWorkload}
            noDataLabel={noData}
            tooltipLabel={t('analytics.chart.invoices')}
          />
        </ChartCard>

        {/* Low Stock Alerts */}
        <ChartCard title={t('analytics.chart.lowStockAlerts')}>
          <LowStockList
            products={data.lowStockProducts}
            emptyLabel={t('analytics.chart.lowStockAlerts.empty')}
            unitLabel={t('analytics.chart.lowStockAlerts.unit')}
          />
        </ChartCard>
      </div>
    </div>
  );
};

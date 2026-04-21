import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@automatize/ui/web', async () => {
  const { createElement } = await import('react');

  const Card = ({
    children,
    _padding,
    _elevation,
  }: {
    children?: React.ReactNode;
    padding?: string;
    elevation?: number;
  }) => createElement('div', { 'data-testid': 'card' }, children);

  const Text = ({
    _variant,
    className,
    children,
  }: {
    variant?: string;
    className?: string;
    children?: React.ReactNode;
  }) => createElement('span', { className }, children);

  return { Card, Text };
});

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (params) {
        return Object.entries(params).reduce(
          (acc, [k, v]) => acc.replace(`{{${k}}}`, v),
          key
        );
      }
      return key;
    },
  }),
}));

vi.mock('recharts', async () => {
  const { createElement } = await import('react');

  const Passthrough = ({
    children,
    _data,
    _dataKey,
    _type,
    _stroke,
    _fill,
    _nameKey,
    _cx,
    _cy,
    _innerRadius,
    _outerRadius,
    _paddingAngle,
    _layout,
    _tickFormatter,
    _width,
    _radius,
    _maxBarSize,
    _strokeWidth,
    _dot,
    _activeDot,
    _allowDecimals,
    _vertical,
    _horizontal,
    ...rest
  }: Record<string, unknown> & { children?: React.ReactNode }) => {
    const safeProps: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (typeof v !== 'function' && typeof v !== 'object') {
        safeProps[k] = v;
      }
    }
    return createElement(
      'div',
      { 'data-testid': 'recharts-wrapper', ...safeProps },
      children
    );
  };

  const createComponent = (name: string) => {
    const Comp = (props: Record<string, unknown>) =>
      Passthrough({ ...props, 'data-testid': `recharts-${name}` });
    Comp.displayName = name;
    return Comp;
  };

  return {
    AreaChart: createComponent('AreaChart'),
    Area: createComponent('Area'),
    BarChart: createComponent('BarChart'),
    Bar: createComponent('Bar'),
    PieChart: createComponent('PieChart'),
    Pie: createComponent('Pie'),
    Cell: createComponent('Cell'),
    XAxis: createComponent('XAxis'),
    YAxis: createComponent('YAxis'),
    CartesianGrid: createComponent('CartesianGrid'),
    Tooltip: createComponent('Tooltip'),
    Legend: createComponent('Legend'),
    ResponsiveContainer: ({ children }: { children?: React.ReactNode }) =>
      createElement('div', { 'data-testid': 'responsive-container' }, children),
  };
});

vi.mock('lucide-react', () => ({
  DollarSign: () =>
    React.createElement('span', { 'data-testid': 'icon-dollar' }),
  FileText: () => React.createElement('span', { 'data-testid': 'icon-file' }),
  TrendingUp: () =>
    React.createElement('span', { 'data-testid': 'icon-trending' }),
  Users: () => React.createElement('span', { 'data-testid': 'icon-users' }),
  Package: () => React.createElement('span', { 'data-testid': 'icon-package' }),
  Wrench: () => React.createElement('span', { 'data-testid': 'icon-wrench' }),
  AlertTriangle: () =>
    React.createElement('span', { 'data-testid': 'icon-alert' }),
}));

import { AnalyticsScreen } from '../AnalyticsScreen.web';
import type { AnalyticsScreenProps } from '../AnalyticsScreen.types';
import type { InvoiceRow } from '../../invoice/InvoiceScreen.types';
import type { InvoiceFormData } from '../../invoice-form/InvoiceFormScreen.types';
import type { ClientRow } from '../../client/ClientScreen.types';
import type { ProductRow } from '../../product/ProductScreen.types';
import type { TechnicianRow } from '../../technician/TechnicianScreen.types';

const mockInvoices: InvoiceRow[] = [
  {
    id: 'inv-1',
    clientName: 'Client A',
    date: '2024-01-15',
    warrantyMonths: 3,
    total: 1500,
  },
  {
    id: 'inv-2',
    clientName: 'Client B',
    date: '2024-02-20',
    warrantyMonths: 0,
    total: 2500,
  },
  {
    id: 'inv-3',
    clientName: 'Client C',
    date: '2024-03-10',
    warrantyMonths: 12,
    total: 3000,
  },
];

const mockInvoiceDetails = new Map<string, InvoiceFormData>([
  [
    'inv-1',
    {
      clientId: 'cl-1',
      clientName: 'Client A',
      clientAddresses: [],
      clientPhones: [],
      products: [
        {
          id: 'p1',
          productId: 'prod-1',
          name: 'Product A',
          unitPrice: 500,
          quantity: 2,
          availableStock: 10,
          totalPrice: 1000,
        },
        {
          id: 'p2',
          productId: 'prod-2',
          name: 'Product B',
          unitPrice: 500,
          quantity: 1,
          availableStock: 10,
          totalPrice: 500,
        },
      ],
      technicians: [{ id: 'tech-1', name: 'Tech A', active: true }],
      warrantyMonths: 3,
      additionalInfo: '',
      total: 1500,
    },
  ],
  [
    'inv-2',
    {
      clientId: 'cl-2',
      clientName: 'Client B',
      clientAddresses: [],
      clientPhones: [],
      products: [
        {
          id: 'p3',
          productId: 'prod-1',
          name: 'Product A',
          unitPrice: 500,
          quantity: 5,
          availableStock: 10,
          totalPrice: 2500,
        },
      ],
      technicians: [
        { id: 'tech-1', name: 'Tech A', active: true },
        { id: 'tech-2', name: 'Tech B', active: true },
      ],
      warrantyMonths: 0,
      additionalInfo: '',
      total: 2500,
    },
  ],
  [
    'inv-3',
    {
      clientId: 'cl-3',
      clientName: 'Client C',
      clientAddresses: [],
      clientPhones: [],
      products: [],
      technicians: [],
      warrantyMonths: 12,
      additionalInfo: '',
      total: 3000,
    },
  ],
]);

const mockClients: ClientRow[] = [
  {
    id: 'cl-1',
    name: 'Client A',
    clientType: 'individual',
    addresses: [],
    phones: [],
  },
  {
    id: 'cl-2',
    name: 'Client B',
    clientType: 'business',
    addresses: [],
    phones: [],
  },
  {
    id: 'cl-3',
    name: 'Client C',
    clientType: 'individual',
    addresses: [],
    phones: [],
  },
];

const mockProducts: ProductRow[] = [
  { id: 'prod-1', name: 'Product A', quantity: 10, price: 500 },
  { id: 'prod-2', name: 'Product B', quantity: 2, price: 500 },
  { id: 'prod-3', name: 'Product C', quantity: 0, price: 200 },
];

const mockTechnicians: TechnicianRow[] = [
  { id: 'tech-1', name: 'Tech A', entryDate: '2024-01-01' },
  { id: 'tech-2', name: 'Tech B', entryDate: '2024-02-01' },
];

function defaultProps(): AnalyticsScreenProps {
  return {
    invoices: mockInvoices,
    invoiceDetails: mockInvoiceDetails,
    clients: mockClients,
    products: mockProducts,
    technicians: mockTechnicians,
  };
}

function renderAnalytics(overrides: Partial<AnalyticsScreenProps> = {}) {
  return render(<AnalyticsScreen {...defaultProps()} {...overrides} />);
}

describe('AnalyticsScreen (web)', () => {
  it('renders all six KPI card titles', () => {
    renderAnalytics();
    expect(
      screen.getAllByText('analytics.kpi.totalRevenue').length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('analytics.kpi.totalInvoices').length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('analytics.kpi.avgInvoiceValue').length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('analytics.kpi.totalClients').length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('analytics.kpi.totalProducts').length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('analytics.kpi.activeTechnicians').length
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders revenue value formatted as BRL currency', () => {
    renderAnalytics();
    expect(screen.getByText('R$ 7.000,00')).toBeDefined();
  });

  it('renders invoice count', () => {
    renderAnalytics();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  it('renders average invoice value', () => {
    renderAnalytics();
    expect(screen.getByText('R$ 2.333,33')).toBeDefined();
  });

  it('renders total clients count', () => {
    renderAnalytics();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  it('renders total products count', () => {
    renderAnalytics();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  it('renders active technicians count', () => {
    renderAnalytics();
    expect(screen.getByText('2')).toBeDefined();
  });

  it('renders all chart section titles', () => {
    renderAnalytics();
    expect(screen.getByText('analytics.chart.revenueOverTime')).toBeDefined();
    expect(screen.getByText('analytics.chart.invoicesOverTime')).toBeDefined();
    expect(
      screen.getByText('analytics.chart.clientTypeDistribution')
    ).toBeDefined();
    expect(
      screen.getByText('analytics.chart.topClientsByRevenue')
    ).toBeDefined();
    expect(
      screen.getByText('analytics.chart.topProductsByRevenue')
    ).toBeDefined();
    expect(
      screen.getByText('analytics.chart.topProductsByQuantity')
    ).toBeDefined();
    expect(
      screen.getByText('analytics.chart.technicianWorkload')
    ).toBeDefined();
    expect(screen.getByText('analytics.chart.lowStockAlerts')).toBeDefined();
  });

  it('renders recharts responsive containers for charts', () => {
    renderAnalytics();
    const containers = screen.getAllByTestId('responsive-container');
    expect(containers.length).toBeGreaterThanOrEqual(5);
  });

  it('shows low stock product names', () => {
    renderAnalytics();
    expect(screen.getByText('Product B')).toBeDefined();
    expect(screen.getByText('Product C')).toBeDefined();
  });

  it('renders empty state when no data', () => {
    renderAnalytics({
      invoices: [],
      invoiceDetails: new Map(),
      clients: [],
      products: [],
      technicians: [],
    });
    const noDataLabels = screen.getAllByText('analytics.chart.noData');
    expect(noDataLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('renders low stock empty message when all products well stocked', () => {
    renderAnalytics({
      invoices: [],
      invoiceDetails: new Map(),
      clients: [],
      products: [{ id: 'p1', name: 'P1', quantity: 50, price: 100 }],
      technicians: [],
    });
    expect(
      screen.getByText('analytics.chart.lowStockAlerts.empty')
    ).toBeDefined();
  });

  it('computes client type breakdown description', () => {
    renderAnalytics();
    expect(
      screen.getByText('analytics.kpi.totalClients.breakdown')
    ).toBeDefined();
  });

  it('computes inventory value description', () => {
    renderAnalytics();
    expect(
      screen.getByText('analytics.kpi.totalProducts.inventoryValue')
    ).toBeDefined();
  });
});

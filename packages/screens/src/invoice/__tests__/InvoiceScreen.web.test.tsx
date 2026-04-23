import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web
vi.mock('@automatize/ui/web', async () => {
  const { createElement } = await import('react');

  type _WithChildren = { children?: React.ReactNode };

  const Table = ({
    columns,
    data,
    toolbarLeft,
    toolbarRight,
    onRowClick,
    emptyMessage,
  }: {
    columns: Array<{
      key: string;
      header: string;
      render?: (item: unknown) => React.ReactNode;
    }>;
    data: unknown[];
    toolbarLeft?: React.ReactNode;
    toolbarRight?: React.ReactNode;
    onRowClick?: (item: unknown) => void;
    emptyMessage?: string;
  }) => {
    const headers = columns.map((col) =>
      createElement('th', { key: col.key }, col.header)
    );
    const rows = data.map((item: Record<string, unknown>, idx) =>
      createElement(
        'tr',
        { key: idx, onClick: () => onRowClick?.(item) },
        columns.map((col) =>
          createElement(
            'td',
            { key: col.key },
            col.render ? col.render(item) : String(item[col.key])
          )
        )
      )
    );

    return createElement('div', null, [
      createElement(
        'div',
        { key: 'toolbar' },
        createElement('div', { className: 'toolbar-left' }, toolbarLeft),
        createElement('div', { className: 'toolbar-right' }, toolbarRight)
      ),
      createElement(
        'table',
        { key: 'table' },
        createElement('thead', null, createElement('tr', null, headers)),
        createElement(
          'tbody',
          null,
          rows.length > 0
            ? rows
            : createElement(
                'tr',
                null,
                createElement('td', { colSpan: columns.length }, emptyMessage)
              )
        )
      ),
    ]);
  };

  const Drawer = ({
    open,
    onClose,
    title,
    footer,
    children,
  }: {
    open: boolean;
    onClose: () => void;
    title?: string;
    footer?: React.ReactNode;
    children?: React.ReactNode;
  }) => {
    return open
      ? createElement(
          'div',
          { 'data-testid': 'drawer' },
          createElement('div', {
            onClick: onClose,
            className: 'drawer-backdrop',
          }),
          createElement(
            'div',
            { className: 'drawer-content' },
            createElement('h2', null, title),
            createElement('div', { className: 'drawer-body' }, children),
            createElement('div', { className: 'drawer-footer' }, footer)
          )
        )
      : null;
  };

  const BottomSheet = ({
    open,
    onClose,
    title,
    footer,
    children,
  }: {
    open: boolean;
    onClose: () => void;
    title?: string;
    footer?: React.ReactNode;
    children?: React.ReactNode;
  }) => {
    return open
      ? createElement(
          'div',
          { 'data-testid': 'bottomsheet' },
          createElement('div', { onClick: onClose, className: 'bs-backdrop' }),
          createElement(
            'div',
            { className: 'bs-content' },
            createElement('h2', null, title),
            createElement('div', { className: 'bs-body' }, children),
            createElement('div', { className: 'bs-footer' }, footer)
          )
        )
      : null;
  };

  const Separator = () => createElement('hr', { 'data-testid': 'separator' });

  const Text = ({
    _variant,
    className,
    children,
  }: {
    variant?: string;
    className?: string;
    children?: React.ReactNode;
  }) => createElement('span', { className }, children);

  const Input = ({
    value,
    onChange,
    placeholder,
    className,
    'aria-label': ariaLabel,
  }: {
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    placeholder?: string;
    className?: string;
    'aria-label'?: string;
  }) =>
    createElement('input', {
      value,
      onChange: (e) => onChange(e),
      placeholder,
      className,
      'aria-label': ariaLabel,
    });

  const PrimaryButton = ({
    children,
    onClick,
    className,
    type,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    type?: string;
  }) => createElement('button', { onClick, className, type }, children);

  const SecondaryButton = ({
    children,
    onClick,
    'aria-label': ariaLabel,
    _size,
    className,
    type,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    'aria-label'?: string;
    size?: string;
    className?: string;
    type?: string;
  }) =>
    createElement(
      'button',
      { onClick, 'aria-label': ariaLabel, className, type },
      children
    );

  const Plus = () => createElement('span', { 'data-testid': 'plus-icon' }, '+');
  const Search = () =>
    createElement('span', { 'data-testid': 'search-icon' }, 'search');
  const Shield = () => createElement('span', { 'data-testid': 'shield-icon' });
  const Calendar = () =>
    createElement('span', { 'data-testid': 'calendar-icon' });
  const DollarSign = () =>
    createElement('span', { 'data-testid': 'dollar-icon' });
  const Users = () => createElement('span', { 'data-testid': 'users-icon' });
  const PrimaryChip = ({ children }: { children?: React.ReactNode }) =>
    createElement('span', { 'data-testid': 'primary-chip' }, children);

  return {
    Table,
    Drawer,
    BottomSheet,
    Separator,
    Text,
    Input,
    PrimaryButton,
    SecondaryButton,
    Plus,
    Search,
    Shield,
    Calendar,
    DollarSign,
    Users,
    PrimaryChip,
  };
});

// Mock useResponsive
vi.mock('@automatize/ui/responsive', () => ({
  useResponsive: () => ({ isMobile: false, isTablet: false, isDesktop: true }),
}));

// Mock useTranslation
vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { InvoiceScreen } from '../InvoiceScreen.web';
import type { InvoiceRow, InvoiceScreenProps } from '../InvoiceScreen.types';

const mockInvoices: InvoiceRow[] = [
  {
    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    clientName: 'John Doe',
    date: '2024-01-15',
    warrantyMonths: 3,
    total: 1500.0,
  },
  {
    id: '01ARZ3NDEKTSV4RRFFQ69G5FBV',
    clientName: 'Jane Smith',
    date: '2024-02-20',
    warrantyMonths: 0,
    total: 2500.5,
  },
  {
    id: '01ARZ3NDEKTSV4RRFFQ69G5FCV',
    clientName: 'Acme Corp',
    date: '2024-03-10',
    warrantyMonths: 12,
    total: 10000.0,
  },
];

function renderInvoiceScreen(overrides: Partial<InvoiceScreenProps> = {}) {
  const onAddInvoice = vi.fn();
  const onEditInvoice = vi.fn();

  const props: InvoiceScreenProps = {
    invoices: mockInvoices,
    onAddInvoice,
    onEditInvoice,
    ...overrides,
  };

  const result = render(<InvoiceScreen {...props} />);
  return { ...result, onAddInvoice, onEditInvoice };
}

describe('InvoiceScreen (web)', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────
  it('renders table with invoice data', () => {
    renderInvoiceScreen();
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('Jane Smith')).toBeDefined();
    expect(screen.getByText('Acme Corp')).toBeDefined();
  });

  it('renders search input', () => {
    renderInvoiceScreen();
    expect(screen.getByPlaceholderText(/invoice.list.search/i)).toBeDefined();
  });

  it('renders add button', () => {
    renderInvoiceScreen();
    expect(
      screen.getByRole('button', { name: /invoice.list.add/i })
    ).toBeDefined();
  });

  it('renders empty message when no invoices', () => {
    renderInvoiceScreen({ invoices: [] });
    expect(screen.getByText(/invoice.list.empty/i)).toBeDefined();
  });

  // ── Search ─────────────────────────────────────────────────────────────────
  it('filters invoices by client name', () => {
    renderInvoiceScreen();
    const searchInput = screen.getByPlaceholderText(/invoice.list.search/i);

    fireEvent.input(searchInput, { target: { value: 'John' } });

    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.queryByText('Jane Smith')).toBeNull();
    expect(screen.queryByText('Acme Corp')).toBeNull();
  });

  it('filters invoices by id', () => {
    renderInvoiceScreen();
    const searchInput = screen.getByPlaceholderText(/invoice.list.search/i);

    fireEvent.input(searchInput, {
      target: { value: '01ARZ3NDEKTSV4RRFFQ69G5FBV' },
    });

    expect(screen.getByText('Jane Smith')).toBeDefined();
    expect(screen.queryByText('John Doe')).toBeNull();
    expect(screen.queryByText('Acme Corp')).toBeNull();
  });

  it('shows all invoices when search is cleared', () => {
    renderInvoiceScreen();
    const searchInput = screen.getByPlaceholderText(/invoice.list.search/i);

    fireEvent.input(searchInput, { target: { value: 'John' } });
    expect(screen.getByText('John Doe')).toBeDefined();

    fireEvent.input(searchInput, { target: { value: '' } });
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('Jane Smith')).toBeDefined();
    expect(screen.getByText('Acme Corp')).toBeDefined();
  });

  // ── Interactions ───────────────────────────────────────────────────────────
  it('calls onAddInvoice when add button is clicked', () => {
    const { onAddInvoice } = renderInvoiceScreen();
    const addButton = screen.getByRole('button', { name: /invoice.list.add/i });
    fireEvent.click(addButton);
    expect(onAddInvoice).toHaveBeenCalled();
  });

  it('opens drawer when a row is clicked', () => {
    renderInvoiceScreen();
    const row = screen.getByText('John Doe').closest('tr');
    expect(row).not.toBeNull();
    fireEvent.click(row as Element);

    expect(screen.getByTestId('drawer')).toBeDefined();
    expect(screen.getByText('invoice.detail.client')).toBeDefined();
  });

  it('closes drawer when close button is clicked', () => {
    renderInvoiceScreen();
    const row = screen.getByText('John Doe').closest('tr');
    expect(row).not.toBeNull();
    fireEvent.click(row as Element);

    expect(screen.getByTestId('drawer')).toBeDefined();

    const backdrop = document.querySelector('.drawer-backdrop');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);

    expect(screen.queryByTestId('drawer')).toBeNull();
  });

  it('calls onEditInvoice with invoice data when edit button is clicked', () => {
    const { onEditInvoice } = renderInvoiceScreen();
    const row = screen.getByText('John Doe').closest('tr');
    expect(row).not.toBeNull();
    fireEvent.click(row as Element);

    const editButton = screen.getByRole('button', {
      name: /invoice.detail.edit/i,
    });
    fireEvent.click(editButton);

    expect(onEditInvoice).toHaveBeenCalledWith(
      expect.objectContaining({ clientName: 'John Doe' })
    );
  });

  // ── Detail View ────────────────────────────────────────────────────────────
  it('displays client name in detail view', () => {
    renderInvoiceScreen();
    const row = screen.getByText('John Doe').closest('tr');
    expect(row).not.toBeNull();
    fireEvent.click(row as Element);

    const drawer = screen.getByTestId('drawer');
    expect(
      within(drawer).getAllByText('John Doe').length
    ).toBeGreaterThanOrEqual(1);
  });

  it('displays formatted date in detail view', () => {
    renderInvoiceScreen();
    const row = screen.getByText('John Doe').closest('tr');
    expect(row).not.toBeNull();
    fireEvent.click(row as Element);

    const drawer = screen.getByTestId('drawer');
    expect(within(drawer).getByText('15/01/2024')).toBeDefined();
  });

  it('displays warranty months in detail view', () => {
    renderInvoiceScreen();
    const row = screen.getByText('John Doe').closest('tr');
    expect(row).not.toBeNull();
    fireEvent.click(row as Element);

    const drawer = screen.getByTestId('drawer');
    expect(
      within(drawer).getByText(/invoice.detail.warrantyValue/i)
    ).toBeDefined();
  });

  it('displays "—" when warranty months is 0', () => {
    renderInvoiceScreen();
    const row = screen.getByText('Jane Smith').closest('tr');
    expect(row).not.toBeNull();
    fireEvent.click(row as Element);

    const drawer = screen.getByTestId('drawer');
    expect(within(drawer).getByText('—')).toBeDefined();
  });

  it('displays formatted total in detail view', () => {
    renderInvoiceScreen();
    const row = screen.getByText('John Doe').closest('tr');
    expect(row).not.toBeNull();
    fireEvent.click(row as Element);

    const drawer = screen.getByTestId('drawer');
    expect(within(drawer).getByText('R$ 1.500,00')).toBeDefined();
  });
});

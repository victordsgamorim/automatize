import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Shield,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react';
import {
  SecondaryButton,
  PrimaryButton,
  Input,
  Table,
  Drawer,
  BottomSheet,
  Separator,
  Text,
} from '@automatize/ui/web';
import type { TableColumn } from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { useResponsive } from '@automatize/ui/responsive';
import type { InvoiceScreenProps, InvoiceRow } from './InvoiceScreen.types';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function matchesSearch(invoice: InvoiceRow, query: string): boolean {
  const q = query.toLowerCase();
  return (
    invoice.clientName.toLowerCase().includes(q) ||
    invoice.id.toLowerCase().includes(q)
  );
}

export const InvoiceScreen: React.FC<InvoiceScreenProps> = ({
  invoices,
  onAddInvoice,
  onEditInvoice,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(
    null
  );

  const filteredInvoices = useMemo(() => {
    const query = search.trim();
    if (!query) return invoices;
    return invoices.filter((inv) => matchesSearch(inv, query));
  }, [invoices, search]);

  const columns: TableColumn<InvoiceRow>[] = useMemo(
    () => [
      {
        key: 'id',
        header: t('invoice.table.id'),
        flex: 1,
        minWidth: 80,
        sortable: false,
        render: (invoice) => (
          <span className="text-xs text-muted-foreground font-mono truncate">
            #{invoice.id.slice(-8).toUpperCase()}
          </span>
        ),
      },
      {
        key: 'clientName',
        header: t('invoice.table.client'),
        flex: 3,
        minWidth: 140,
        sortable: true,
        sortFn: (a, b) => a.clientName.localeCompare(b.clientName),
        render: (invoice) => (
          <span className="text-sm text-foreground font-medium truncate">
            {invoice.clientName}
          </span>
        ),
      },
      {
        key: 'date',
        header: t('invoice.table.date'),
        flex: 2,
        minWidth: 100,
        sortable: true,
        sortFn: (a, b) => a.date.localeCompare(b.date),
        render: (invoice) => (
          <span className="text-sm text-foreground/80">
            {formatDate(invoice.date)}
          </span>
        ),
      },
      {
        key: 'warrantyMonths',
        header: t('invoice.table.warranty'),
        flex: 1,
        minWidth: 90,
        sortable: true,
        sortFn: (a, b) => a.warrantyMonths - b.warrantyMonths,
        render: (invoice) => (
          <span className="text-sm text-foreground/80">
            {invoice.warrantyMonths > 0
              ? t('invoice.detail.warrantyValue', {
                  months: String(invoice.warrantyMonths),
                })
              : '—'}
          </span>
        ),
      },
      {
        key: 'total',
        header: t('invoice.table.total'),
        flex: 2,
        minWidth: 110,
        sortable: true,
        sortFn: (a, b) => a.total - b.total,
        render: (invoice) => (
          <span className="text-sm font-semibold text-primary">
            {formatPrice(invoice.total)}
          </span>
        ),
      },
    ],
    [t]
  );

  const handleRowClick = (invoice: InvoiceRow) => {
    setSelectedInvoice(invoice);
  };

  const handleCloseDetail = () => {
    setSelectedInvoice(null);
  };

  const handleEdit = () => {
    if (!selectedInvoice) return;
    onEditInvoice?.(selectedInvoice);
    setSelectedInvoice(null);
  };

  const detailContent = selectedInvoice ? (
    <div className="space-y-6">
      {/* Client */}
      <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
          <Users className="size-5" />
        </div>
        <div className="min-w-0">
          <Text variant="label" className="block text-muted-foreground">
            {t('invoice.detail.client')}
          </Text>
          <Text variant="body" className="font-medium">
            {selectedInvoice.clientName}
          </Text>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
            <Calendar className="size-5" />
          </div>
          <div className="min-w-0">
            <Text variant="label" className="block text-muted-foreground">
              {t('invoice.detail.date')}
            </Text>
            <Text variant="body" className="font-medium">
              {formatDate(selectedInvoice.date)}
            </Text>
          </div>
        </div>

        {/* Warranty */}
        <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
            <Shield className="size-5" />
          </div>
          <div className="min-w-0">
            <Text variant="label" className="block text-muted-foreground">
              {t('invoice.detail.warranty')}
            </Text>
            <Text variant="body" className="font-medium">
              {selectedInvoice.warrantyMonths > 0
                ? t('invoice.detail.warrantyValue', {
                    months: String(selectedInvoice.warrantyMonths),
                  })
                : '—'}
            </Text>
          </div>
        </div>
      </div>

      <Separator />

      {/* Total */}
      <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
          <DollarSign className="size-5" />
        </div>
        <div className="min-w-0">
          <Text variant="label" className="block text-muted-foreground">
            {t('invoice.detail.total')}
          </Text>
          <Text variant="body" className="font-bold text-primary text-lg">
            {formatPrice(selectedInvoice.total)}
          </Text>
        </div>
      </div>
    </div>
  ) : null;

  const detailFooter = selectedInvoice ? (
    <PrimaryButton type="button" onClick={handleEdit} className="w-full">
      {t('invoice.detail.edit')}
    </PrimaryButton>
  ) : null;

  return (
    <>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Table<InvoiceRow>
          columns={columns}
          data={filteredInvoices}
          selectable={false}
          toolbarLeft={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('invoice.list.search')}
                className="pl-9 backdrop-blur-none"
                aria-label={t('invoice.list.search')}
              />
            </div>
          }
          toolbarRight={
            <SecondaryButton
              size="icon"
              onClick={onAddInvoice}
              aria-label={t('invoice.list.add')}
              className="size-8"
            >
              <Plus className="size-4" />
            </SecondaryButton>
          }
          getItemId={(invoice) => invoice.id}
          onRowClick={handleRowClick}
          emptyMessage={t('invoice.list.empty')}
          itemLabel={t('invoice.list.itemLabel')}
          previousLabel={t('invoice.list.previous')}
          nextLabel={t('invoice.list.next')}
          pageLabel={(current, total) =>
            t('invoice.list.page', {
              current: String(current),
              total: String(total),
            })
          }
        />
      </div>

      {isMobile ? (
        <BottomSheet
          open={selectedInvoice !== null}
          onClose={handleCloseDetail}
          title={selectedInvoice?.clientName ?? ''}
          footer={detailFooter}
        >
          {detailContent}
        </BottomSheet>
      ) : (
        <Drawer
          open={selectedInvoice !== null}
          onClose={handleCloseDetail}
          title={
            selectedInvoice
              ? `#${selectedInvoice.id.slice(-8).toUpperCase()} — ${selectedInvoice.clientName}`
              : ''
          }
          footer={detailFooter}
        >
          {detailContent}
        </Drawer>
      )}
    </>
  );
};

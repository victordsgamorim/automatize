import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Shield,
  Calendar,
  DollarSign,
  Users,
  Phone,
  Smartphone,
  MapPin,
  Home,
  Store,
  Package,
  Wrench,
  FileText,
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
  PrimaryChip,
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
        render: (invoice) =>
          invoice.warrantyMonths > 0 ? (
            <PrimaryChip>
              {t('invoice.detail.warrantyValue', {
                months: String(invoice.warrantyMonths),
              })}
            </PrimaryChip>
          ) : (
            <span className="text-sm text-foreground/80">—</span>
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
    <div className="space-y-5">
      {/* Client */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-muted/20">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
          <Users className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
          <Text variant="caption" className="text-muted-foreground shrink-0">
            {t('invoice.detail.client')}
          </Text>
          <Text variant="bodySmall" className="font-medium truncate text-right">
            {selectedInvoice.clientName}
          </Text>
        </div>
      </div>

      {/* Client Phones */}
      {selectedInvoice.clientPhones &&
        selectedInvoice.clientPhones.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Phone className="size-4 text-muted-foreground" />
                <Text variant="label">{t('invoice.client.phones')}</Text>
              </div>
              <div className="space-y-2">
                {selectedInvoice.clientPhones.map((p) => {
                  const isMobilePhone = p.phoneType !== 'telephone';
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg border border-border bg-muted/20"
                    >
                      <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                        {isMobilePhone ? (
                          <Smartphone className="size-3.5" />
                        ) : (
                          <Phone className="size-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                        {p.phoneType && (
                          <Text
                            variant="caption"
                            className="text-muted-foreground shrink-0"
                          >
                            {t(
                              isMobilePhone
                                ? 'client.phone.type.mobile'
                                : 'client.phone.type.telephone'
                            )}
                          </Text>
                        )}
                        <Text
                          variant="bodySmall"
                          className="font-medium whitespace-nowrap tabular-nums ml-auto"
                        >
                          {p.number}
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      {/* Client Addresses */}
      {selectedInvoice.clientAddresses &&
        selectedInvoice.clientAddresses.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="size-4 text-muted-foreground" />
                <Text variant="label">{t('invoice.client.addresses')}</Text>
              </div>
              <div className="space-y-2">
                {selectedInvoice.clientAddresses.map((a) => {
                  const streetLine = [a.street, a.number]
                    .filter(Boolean)
                    .join(', ');
                  const cityLine = [a.city, a.state]
                    .filter(Boolean)
                    .join(' - ');
                  const isEstablishment = a.addressType === 'establishment';
                  return (
                    <div
                      key={a.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-muted/20"
                    >
                      <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                        {isEstablishment ? (
                          <Store className="size-3.5" />
                        ) : (
                          <Home className="size-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {a.addressType && (
                          <Text
                            variant="caption"
                            className="text-muted-foreground block mb-0.5"
                          >
                            {t(
                              isEstablishment
                                ? 'client.address.type.establishment'
                                : 'client.address.type.residence'
                            )}
                          </Text>
                        )}
                        {streetLine && (
                          <Text
                            variant="bodySmall"
                            className="font-medium block truncate"
                          >
                            {streetLine}
                          </Text>
                        )}
                        {a.neighborhood && (
                          <Text
                            variant="caption"
                            className="text-foreground/80 block truncate"
                          >
                            {a.neighborhood}
                          </Text>
                        )}
                        {cityLine && (
                          <Text
                            variant="caption"
                            className="text-foreground/80 block"
                          >
                            {cityLine}
                          </Text>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        {/* Date */}
        <div className="flex flex-col gap-1 p-2.5 rounded-lg border border-border bg-muted/20">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary" />
            <Text variant="caption" className="text-muted-foreground">
              {t('invoice.detail.date')}
            </Text>
          </div>
          <Text
            variant="bodySmall"
            className="font-medium whitespace-nowrap tabular-nums block"
          >
            {formatDate(selectedInvoice.date)}
          </Text>
        </div>

        {/* Warranty */}
        <div className="flex flex-col gap-1 p-2.5 rounded-lg border border-border bg-muted/20">
          <div className="flex items-center gap-1.5">
            <Shield className="size-3.5 text-primary" />
            <Text variant="caption" className="text-muted-foreground">
              {t('invoice.detail.warranty')}
            </Text>
          </div>
          {selectedInvoice.warrantyMonths > 0 ? (
            <PrimaryChip>
              {t('invoice.detail.warrantyValue', {
                months: String(selectedInvoice.warrantyMonths),
              })}
            </PrimaryChip>
          ) : (
            <Text variant="bodySmall" className="font-medium">
              —
            </Text>
          )}
        </div>
      </div>

      <Separator />

      {/* Products */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Package className="size-4 text-muted-foreground" />
          <Text variant="label">{t('invoice.detail.products')}</Text>
        </div>
        {!selectedInvoice.products || selectedInvoice.products.length === 0 ? (
          <Text variant="caption" className="text-muted-foreground">
            {t('invoice.detail.noProducts')}
          </Text>
        ) : (
          <div className="space-y-2">
            {selectedInvoice.products.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-lg border border-border bg-muted/20"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <Text variant="bodySmall" className="font-medium truncate">
                    {p.name}
                  </Text>
                  <Text
                    variant="bodySmall"
                    className="font-bold whitespace-nowrap tabular-nums shrink-0"
                  >
                    ×{p.quantity}
                  </Text>
                </div>
                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                  <Text
                    variant="caption"
                    className="text-muted-foreground whitespace-nowrap tabular-nums"
                  >
                    {formatPrice(p.unitPrice)}/un
                  </Text>
                  <Text
                    variant="caption"
                    className="text-foreground/80 font-medium whitespace-nowrap tabular-nums shrink-0"
                  >
                    {formatPrice(p.totalPrice)}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Technicians */}
      {selectedInvoice.technicians !== undefined && (
        <>
          <Separator />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="size-4 text-muted-foreground" />
              <Text variant="label">{t('invoice.detail.technicians')}</Text>
            </div>
            {selectedInvoice.technicians.length === 0 ? (
              <Text variant="caption" className="text-muted-foreground">
                {t('invoice.detail.noTechnicians')}
              </Text>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedInvoice.technicians.map((tech) => (
                  <div
                    key={tech.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-muted/20"
                  >
                    <Wrench className="size-3 text-primary shrink-0" />
                    <Text
                      variant="caption"
                      className="font-medium whitespace-nowrap"
                    >
                      {tech.name}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Additional Info */}
      {selectedInvoice.additionalInfo && (
        <>
          <Separator />
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-muted/20">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
              <FileText className="size-3.5" />
            </div>
            <div className="min-w-0">
              <Text variant="caption" className="text-muted-foreground block">
                {t('invoice.detail.additionalInfo')}
              </Text>
              <Text variant="bodySmall" className="break-words mt-0.5">
                {selectedInvoice.additionalInfo}
              </Text>
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Total */}
      <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-primary/5">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary shrink-0">
          <DollarSign className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
          <Text variant="caption" className="text-muted-foreground shrink-0">
            {t('invoice.detail.total')}
          </Text>
          <Text
            variant="body"
            className="font-bold text-primary text-lg whitespace-nowrap tabular-nums"
          >
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

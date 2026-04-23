import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  User,
  Building2,
  Home,
  Store,
  Smartphone,
  Phone,
  IdCard,
  MapPin,
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
import type { ClientScreenProps, ClientRow } from './ClientScreen.types';

function formatAddresses(client: ClientRow): string {
  return client.addresses
    .map((a) => {
      const parts = [a.street, a.number, a.neighborhood, a.city, a.state];
      return parts.filter(Boolean).join(', ');
    })
    .join(' | ');
}

function formatPhones(client: ClientRow): string {
  return client.phones.map((p) => p.number).join(', ');
}

function matchesSearch(client: ClientRow, query: string): boolean {
  const q = query.toLowerCase();
  if (client.name.toLowerCase().includes(q)) return true;
  if (client.phones.some((p) => p.number.toLowerCase().includes(q)))
    return true;
  if (
    client.addresses.some((a) =>
      [a.street, a.number, a.neighborhood, a.city, a.state]
        .filter(Boolean)
        .some((part) => part.toLowerCase().includes(q))
    )
  )
    return true;
  return false;
}

export const ClientScreen: React.FC<ClientScreenProps> = ({
  clients,
  onAddClient,
  onEditClient,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);

  const filteredClients = useMemo(() => {
    const query = search.trim();
    if (!query) return clients;
    return clients.filter((client) => matchesSearch(client, query));
  }, [clients, search]);

  const columns: TableColumn<ClientRow>[] = useMemo(
    () => [
      {
        key: 'name',
        header: t('client.table.name'),
        flex: 2,
        minWidth: 140,
        sortable: true,
        sortFn: (a, b) => a.name.localeCompare(b.name),
        render: (client) => (
          <span className="text-sm text-foreground font-medium truncate">
            {client.name}
          </span>
        ),
      },
      {
        key: 'addresses',
        header: t('client.table.addresses'),
        flex: 4,
        minWidth: 180,
        sortable: true,
        sortFn: (a, b) => formatAddresses(a).localeCompare(formatAddresses(b)),
        render: (client) => (
          <span className="text-sm text-foreground/80 truncate">
            {formatAddresses(client)}
          </span>
        ),
      },
      {
        key: 'phones',
        header: t('client.table.phones'),
        flex: 2,
        minWidth: 120,
        sortable: true,
        sortFn: (a, b) => formatPhones(a).localeCompare(formatPhones(b)),
        render: (client) => (
          <span className="text-sm text-foreground/80 truncate">
            {formatPhones(client)}
          </span>
        ),
      },
    ],
    [t]
  );

  const handleRowClick = (client: ClientRow) => {
    setSelectedClient(client);
  };

  const handleCloseDetail = () => {
    setSelectedClient(null);
  };

  const handleEdit = () => {
    if (!selectedClient) return;
    onEditClient?.(selectedClient);
    setSelectedClient(null);
  };

  const detailContent = selectedClient ? (
    <div className="space-y-5">
      {/* Client type + document */}
      {(selectedClient.clientType || selectedClient.document) && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {selectedClient.clientType && (
              <div className="flex flex-col gap-1 p-2.5 rounded-lg border border-border bg-muted/20">
                <Text variant="caption" className="text-muted-foreground">
                  {t('client.detail.type')}
                </Text>
                <div className="flex items-center gap-1.5 min-w-0">
                  {selectedClient.clientType === 'business' ? (
                    <Building2 className="size-3.5 text-primary shrink-0" />
                  ) : (
                    <User className="size-3.5 text-primary shrink-0" />
                  )}
                  <Text variant="bodySmall" className="font-medium truncate">
                    {t(
                      selectedClient.clientType === 'business'
                        ? 'client.type.business'
                        : 'client.type.individual'
                    )}
                  </Text>
                </div>
              </div>
            )}
            {selectedClient.document && (
              <div className="flex flex-col gap-1 p-2.5 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center gap-1.5">
                  <IdCard className="size-3.5 text-primary shrink-0" />
                  <Text variant="caption" className="text-muted-foreground">
                    {t(
                      selectedClient.clientType === 'business'
                        ? 'client.cnpj'
                        : 'client.cpf'
                    )}
                  </Text>
                </div>
                <Text
                  variant="bodySmall"
                  className="font-medium whitespace-nowrap tabular-nums"
                >
                  {selectedClient.document}
                </Text>
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Addresses */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="size-4 text-muted-foreground" />
          <Text variant="label">{t('client.addresses')}</Text>
        </div>
        {selectedClient.addresses.length === 0 ? (
          <Text variant="caption" className="text-muted-foreground">
            {t('client.detail.noAddresses')}
          </Text>
        ) : (
          <div className="space-y-2">
            {selectedClient.addresses.map((a) => {
              const streetLine = [a.street, a.number]
                .filter(Boolean)
                .join(', ');
              const cityLine = [a.city, a.state].filter(Boolean).join(' - ');
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
                    {a.info && (
                      <Text
                        variant="caption"
                        className="text-muted-foreground block mt-0.5"
                      >
                        {a.info}
                      </Text>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Separator />

      {/* Phones */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Phone className="size-4 text-muted-foreground" />
          <Text variant="label">{t('client.phones')}</Text>
        </div>
        {selectedClient.phones.length === 0 ? (
          <Text variant="caption" className="text-muted-foreground">
            {t('client.detail.noPhones')}
          </Text>
        ) : (
          <div className="space-y-2">
            {selectedClient.phones.map((p) => {
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
        )}
      </div>
    </div>
  ) : null;

  const detailFooter = selectedClient ? (
    <PrimaryButton type="button" onClick={handleEdit} className="w-full">
      {t('client.detail.edit')}
    </PrimaryButton>
  ) : null;

  return (
    <>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Table<ClientRow>
          columns={columns}
          data={filteredClients}
          selectable={false}
          toolbarLeft={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('client.list.search')}
                className="pl-9 backdrop-blur-none"
                aria-label={t('client.list.search')}
              />
            </div>
          }
          toolbarRight={
            <SecondaryButton
              size="icon"
              onClick={onAddClient}
              aria-label={t('client.list.add')}
            >
              <Plus className="size-4" />
            </SecondaryButton>
          }
          getItemId={(client) => client.id}
          onRowClick={handleRowClick}
          emptyMessage={t('client.list.empty')}
          itemLabel={t('client.list.itemLabel')}
          previousLabel={t('client.list.previous')}
          nextLabel={t('client.list.next')}
          pageLabel={(current, total) =>
            t('client.list.page', {
              current: String(current),
              total: String(total),
            })
          }
        />
      </div>

      {isMobile ? (
        <BottomSheet
          open={selectedClient !== null}
          onClose={handleCloseDetail}
          title={selectedClient?.name ?? ''}
          footer={detailFooter}
        >
          {detailContent}
        </BottomSheet>
      ) : (
        <Drawer
          open={selectedClient !== null}
          onClose={handleCloseDetail}
          title={selectedClient?.name ?? ''}
          footer={detailFooter}
        >
          {detailContent}
        </Drawer>
      )}
    </>
  );
};

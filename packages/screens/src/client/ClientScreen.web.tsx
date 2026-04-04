import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button, Input, Table } from '@automatize/ui/web';
import type { TableColumn } from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
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
  onClientClick,
  onClientSelect,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <Table<ClientRow>
        columns={columns}
        data={filteredClients}
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
          <Button
            variant="outline"
            size="icon"
            onClick={onAddClient}
            aria-label={t('client.list.add')}
            className="size-8"
          >
            <Plus className="size-4" />
          </Button>
        }
        getItemId={(client) => client.id}
        onRowClick={onClientClick}
        onRowSelect={onClientSelect}
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
  );
};

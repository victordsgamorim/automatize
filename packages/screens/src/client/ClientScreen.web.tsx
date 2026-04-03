import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button, Table } from '@automatize/ui/web';
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

export const ClientScreen: React.FC<ClientScreenProps> = ({
  clients,
  onAddClient,
  onClientClick,
  onClientSelect,
}) => {
  const { t } = useTranslation();

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
      <div className="mb-6 flex items-center justify-end">
        <Button onClick={onAddClient} aria-label={t('client.list.add')}>
          <Plus className="size-4 mr-2" />
          {t('client.list.add')}
        </Button>
      </div>

      <Table<ClientRow>
        columns={columns}
        data={clients}
        getItemId={(client) => client.id}
        onRowClick={onClientClick}
        onRowSelect={onClientSelect}
        emptyMessage={t('client.list.empty')}
        itemLabel={t('client.list.itemLabel')}
        previousLabel={t('client.list.previous')}
        nextLabel={t('client.list.next')}
        sortLabel={t('client.list.sort')}
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

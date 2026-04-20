'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Pencil, Trash2, Check, X, Search, Plus } from 'lucide-react';
import {
  Input,
  PrimaryButton,
  SecondaryButton,
  Table,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@automatize/ui/web';
import type { TableColumn } from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import type { SupplierRow, SupplierScreenProps } from './SupplierScreen.types';

function matchesSearch(supplier: SupplierRow, query: string): boolean {
  return supplier.name.toLowerCase().includes(query.toLowerCase());
}

export const SupplierScreen: React.FC<SupplierScreenProps> = ({
  suppliers,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const filteredSuppliers = useMemo(() => {
    const query = search.trim();
    if (!query) return suppliers;
    return suppliers.filter((s) => matchesSearch(s, query));
  }, [suppliers, search]);

  const handleAdd = useCallback(() => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
    setDialogOpen(false);
  }, [newName, onAdd]);

  const handleOpenDialog = useCallback(() => {
    setNewName('');
    setDialogOpen(true);
  }, []);

  const handleStartEdit = useCallback((row: SupplierRow) => {
    setEditingId(row.id);
    setEditName(row.name);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editName.trim()) return;
    onEdit(editingId, editName.trim());
    setEditingId(null);
  }, [editingId, editName, onEdit]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const columns: TableColumn<SupplierRow>[] = useMemo(
    () => [
      {
        key: 'name',
        header: t('supplier.table.name'),
        flex: 4,
        minWidth: 180,
        sortable: true,
        sortFn: (a, b) => a.name.localeCompare(b.name),
        render: (row) =>
          editingId === row.id ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={t('supplier.form.namePlaceholder')}
              className="h-8 text-sm"
              aria-label={t('supplier.form.name')}
            />
          ) : (
            <span className="text-sm text-foreground font-medium truncate">
              {row.name}
            </span>
          ),
      },
      {
        key: 'actions',
        header: '',
        flex: 1,
        minWidth: 90,
        render: (row) =>
          editingId === row.id ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSaveEdit}
                aria-label={t('supplier.form.save')}
                className="flex items-center justify-center size-7 rounded-md text-primary hover:bg-primary/10 transition-colors"
              >
                <Check className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                aria-label={t('supplier.form.cancel')}
                className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit(row);
                }}
                aria-label={t('supplier.action.edit')}
                className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(row.id);
                }}
                aria-label={t('supplier.action.delete')}
                className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ),
      },
    ],
    [
      t,
      editingId,
      editName,
      handleSaveEdit,
      handleCancelEdit,
      handleStartEdit,
      onDelete,
    ]
  );

  return (
    <>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Table<SupplierRow>
          columns={columns}
          data={filteredSuppliers}
          selectable={false}
          getItemId={(r) => r.id}
          toolbarLeft={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('supplier.list.search')}
                className="pl-9 backdrop-blur-none"
                aria-label={t('supplier.list.search')}
              />
            </div>
          }
          toolbarRight={
            <SecondaryButton
              size="icon"
              onClick={handleOpenDialog}
              aria-label={t('supplier.list.add')}
              className="size-8"
            >
              <Plus className="size-4" />
            </SecondaryButton>
          }
          emptyMessage={t('supplier.list.empty')}
          itemLabel={t('supplier.list.itemLabel')}
          previousLabel={t('supplier.list.previous')}
          nextLabel={t('supplier.list.next')}
          pageLabel={(current, total) =>
            t('supplier.list.page', {
              current: String(current),
              total: String(total),
            })
          }
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('supplier.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('supplier.dialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label
                htmlFor="supplier-name-input"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {t('supplier.form.name')}
              </label>
              <Input
                id="supplier-name-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('supplier.form.namePlaceholder')}
                aria-label={t('supplier.form.name')}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
          </div>
          <DialogFooter>
            <SecondaryButton type="button" onClick={() => setDialogOpen(false)}>
              {t('supplier.form.cancel')}
            </SecondaryButton>
            <PrimaryButton
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim()}
            >
              {t('supplier.form.add')}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

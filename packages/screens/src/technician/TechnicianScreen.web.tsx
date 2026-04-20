'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  CalendarIcon,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  Plus,
} from 'lucide-react';
import {
  Input,
  PrimaryButton,
  SecondaryButton,
  Table,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@automatize/ui/web';
import type { TableColumn } from '@automatize/ui/web';
import { format, parseISO } from 'date-fns';
import { useTranslation } from '@automatize/core-localization';
import type {
  TechnicianRow,
  TechnicianScreenProps,
} from './TechnicianScreen.types';

function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), 'dd/MM/yyyy');
  } catch {
    return '—';
  }
}

function matchesSearch(technician: TechnicianRow, query: string): boolean {
  const q = query.toLowerCase();
  if (technician.name.toLowerCase().includes(q)) return true;
  return false;
}

export const TechnicianScreen: React.FC<TechnicianScreenProps> = ({
  technicians,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState(() =>
    format(new Date(), 'yyyy-MM-dd')
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDateOpen, setEditDateOpen] = useState(false);

  const filteredTechnicians = useMemo(() => {
    const query = search.trim();
    if (!query) return technicians;
    return technicians.filter((tech) => matchesSearch(tech, query));
  }, [technicians, search]);

  const handleAdd = useCallback(() => {
    if (!newName.trim() || !newDate) return;
    onAdd(newName.trim(), newDate);
    setNewName('');
    setNewDate(format(new Date(), 'yyyy-MM-dd'));
    setDialogOpen(false);
  }, [newName, newDate, onAdd]);

  const handleOpenDialog = useCallback(() => {
    setNewName('');
    setNewDate(format(new Date(), 'yyyy-MM-dd'));
    setDialogOpen(true);
  }, []);

  const handleStartEdit = useCallback((row: TechnicianRow) => {
    setEditingId(row.id);
    setEditName(row.name);
    setEditDate(row.entryDate);
    setEditDateOpen(false);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editName.trim() || !editDate) return;
    onEdit(editingId, editName.trim(), editDate);
    setEditingId(null);
    setEditDateOpen(false);
  }, [editingId, editName, editDate, onEdit]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDateOpen(false);
  }, []);

  const columns: TableColumn<TechnicianRow>[] = useMemo(
    () => [
      {
        key: 'name',
        header: t('technician.table.name'),
        flex: 3,
        minWidth: 140,
        sortable: true,
        sortFn: (a, b) => a.name.localeCompare(b.name),
        render: (row) =>
          editingId === row.id ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={t('technician.form.namePlaceholder')}
              className="h-8 text-sm"
              aria-label={t('technician.form.name')}
            />
          ) : (
            <span className="text-sm text-foreground font-medium truncate">
              {row.name}
            </span>
          ),
      },
      {
        key: 'entryDate',
        header: t('technician.table.entryDate'),
        flex: 2,
        minWidth: 130,
        sortable: true,
        sortFn: (a, b) => a.entryDate.localeCompare(b.entryDate),
        render: (row) =>
          editingId === row.id ? (
            <Popover open={editDateOpen} onOpenChange={setEditDateOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-2 py-1 h-8 text-sm border border-border rounded-md bg-background hover:bg-muted/30 transition-colors min-w-[120px]"
                >
                  <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" />
                  <span
                    className={
                      editDate ? 'text-foreground' : 'text-muted-foreground'
                    }
                  >
                    {editDate
                      ? formatDate(editDate)
                      : t('technician.form.datePlaceholder')}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto" align="start">
                <Calendar
                  mode="single"
                  selected={editDate ? parseISO(editDate) : undefined}
                  onSelect={(d) => {
                    if (d) {
                      setEditDate(format(d, 'yyyy-MM-dd'));
                      setEditDateOpen(false);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          ) : (
            <span className="text-sm text-foreground/80">
              {row.entryDate ? formatDate(row.entryDate) : '—'}
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
                aria-label={t('technician.form.save')}
                className="flex items-center justify-center size-7 rounded-md text-primary hover:bg-primary/10 transition-colors"
              >
                <Check className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                aria-label={t('technician.form.cancel')}
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
                aria-label={t('technician.action.edit')}
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
                aria-label={t('technician.action.delete')}
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
      editDate,
      editDateOpen,
      handleSaveEdit,
      handleCancelEdit,
      handleStartEdit,
      onDelete,
    ]
  );

  return (
    <>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Table<TechnicianRow>
          columns={columns}
          data={filteredTechnicians}
          selectable={false}
          getItemId={(r) => r.id}
          toolbarLeft={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('technician.list.search')}
                className="pl-9 backdrop-blur-none"
                aria-label={t('technician.list.search')}
              />
            </div>
          }
          toolbarRight={
            <SecondaryButton
              size="icon"
              onClick={handleOpenDialog}
              aria-label={t('technician.list.add')}
              className="size-8"
            >
              <Plus className="size-4" />
            </SecondaryButton>
          }
          emptyMessage={t('technician.list.empty')}
          itemLabel={t('technician.list.itemLabel')}
          previousLabel={t('technician.list.previous')}
          nextLabel={t('technician.list.next')}
          pageLabel={(current, total) =>
            t('technician.list.page', {
              current: String(current),
              total: String(total),
            })
          }
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('technician.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('technician.dialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label
                htmlFor="technician-name-input"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {t('technician.form.name')}
              </label>
              <Input
                id="technician-name-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('technician.form.namePlaceholder')}
                aria-label={t('technician.form.name')}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('technician.form.entryDate')}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={t('technician.form.entryDate')}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm border border-border rounded-md bg-background hover:bg-muted/30 transition-colors"
                  >
                    <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
                    <span
                      className={
                        newDate ? 'text-foreground' : 'text-muted-foreground'
                      }
                    >
                      {newDate
                        ? formatDate(newDate)
                        : t('technician.form.datePlaceholder')}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={newDate ? parseISO(newDate) : undefined}
                    onSelect={(d) => {
                      if (d) {
                        setNewDate(format(d, 'yyyy-MM-dd'));
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <SecondaryButton type="button" onClick={() => setDialogOpen(false)}>
              {t('technician.form.cancel')}
            </SecondaryButton>
            <PrimaryButton
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim() || !newDate}
            >
              {t('technician.form.add')}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

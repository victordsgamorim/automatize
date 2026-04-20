import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  SecondaryButton,
  PrimaryButton,
  Input,
  Text,
  cn,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import type { Supplier } from '../../ProductFormScreen.types';

export interface SupplierSectionProps {
  suppliers: Supplier[];
  selectedSupplierId?: string;
  onSupplierSelect: (supplierId: string | undefined) => void;
  onAddSupplier?: (name: string) => void;
}

export const SupplierSection: React.FC<SupplierSectionProps> = ({
  suppliers,
  selectedSupplierId,
  onSupplierSelect,
  onAddSupplier,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setAddMode(false);
      setNewSupplierName('');
    }
  };

  const handleSelect = (supplierId: string) => {
    onSupplierSelect(
      supplierId === selectedSupplierId ? undefined : supplierId
    );
    setOpen(false);
  };

  const handleAddSupplier = () => {
    const trimmed = newSupplierName.trim();
    if (!trimmed) return;
    onAddSupplier?.(trimmed);
    setNewSupplierName('');
    setAddMode(false);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Text variant="bodySmall" color="muted">
        {t('product.supplier')}
      </Text>

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
              'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              !selectedSupplier && 'text-muted-foreground'
            )}
          >
            {selectedSupplier
              ? selectedSupplier.name
              : t('product.supplier.placeholder')}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0"
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          align="start"
        >
          {addMode ? (
            <div className="p-3 space-y-3">
              <Text variant="bodySmall" color="muted">
                {t('product.supplier.new')}
              </Text>
              <Input
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder={t('product.supplier.new.placeholder')}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSupplier();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setAddMode(false);
                    setNewSupplierName('');
                  }
                }}
              />
              <div className="flex gap-2 justify-end">
                <SecondaryButton
                  type="button"
                  size="sm"
                  onClick={() => {
                    setAddMode(false);
                    setNewSupplierName('');
                  }}
                >
                  {t('product.cancel')}
                </SecondaryButton>
                <PrimaryButton
                  type="button"
                  size="sm"
                  onClick={handleAddSupplier}
                  disabled={!newSupplierName.trim()}
                >
                  {t('product.supplier.add')}
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <Command>
              <CommandInput placeholder={t('product.supplier.search')} />
              <CommandList>
                <CommandEmpty>{t('product.supplier.empty')}</CommandEmpty>
                <CommandGroup>
                  {suppliers.map((supplier) => (
                    <CommandItem
                      key={supplier.id}
                      value={supplier.name}
                      onSelect={() => handleSelect(supplier.id)}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4',
                          selectedSupplierId === supplier.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {supplier.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
                {onAddSupplier && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem onSelect={() => setAddMode(true)}>
                        <Plus className="mr-2 size-4" />
                        {t('product.supplier.addNew')}
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

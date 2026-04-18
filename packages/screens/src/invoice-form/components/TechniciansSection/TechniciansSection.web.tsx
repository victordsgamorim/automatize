import React, { useState } from 'react';
import { Check, ChevronsUpDown, X, Wrench } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  PrimaryButton,
  SecondaryButton,
  Input,
  Text,
  cn,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import type {
  TechnicianRow,
  InvoiceTechnician,
} from '../../InvoiceFormScreen.types';

export interface TechniciansSectionProps {
  availableTechnicians: TechnicianRow[];
  selectedTechnicians: InvoiceTechnician[];
  onAddTechnician: (tech: TechnicianRow) => void;
  onToggleTechnician: (id: string) => void;
  onRemoveTechnician: (id: string) => void;
  onAddNewTechnician: (name: string) => void;
  onSaveTechnicianToTable?: (name: string) => void;
}

export const TechniciansSection: React.FC<TechniciansSectionProps> = ({
  availableTechnicians,
  selectedTechnicians,
  onAddTechnician,
  onToggleTechnician,
  onRemoveTechnician,
  onAddNewTechnician,
  onSaveTechnicianToTable,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [pendingName, setPendingName] = useState<string | null>(null);

  const selectedIds = new Set(selectedTechnicians.map((tech) => tech.id));

  const handleAddNew = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setNewName('');
    if (onSaveTechnicianToTable) {
      setPendingName(trimmed);
    } else {
      onAddNewTechnician(trimmed);
    }
  };

  const handleSaveToTable = () => {
    if (!pendingName) return;
    onSaveTechnicianToTable?.(pendingName);
    onAddNewTechnician(pendingName);
    setPendingName(null);
  };

  const handleSkipSave = () => {
    if (!pendingName) return;
    onAddNewTechnician(pendingName);
    setPendingName(null);
  };

  const selectedCount = selectedTechnicians.length;

  return (
    <div className="space-y-4">
      <Text variant="bodySmall" color="muted">
        {t('invoice.technicians')}
      </Text>

      {/* Dropdown to pick technicians */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
              'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              selectedCount > 0 ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            <span className="truncate">
              {selectedCount > 0
                ? t('invoice.technicians.selected.count', {
                    count: String(selectedCount),
                  })
                : t('invoice.technicians.select')}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          align="start"
        >
          <Command>
            <CommandInput placeholder={t('invoice.technicians.search')} />
            <CommandList>
              <CommandEmpty>{t('invoice.technicians.empty')}</CommandEmpty>
              <CommandGroup>
                {availableTechnicians.map((tech) => {
                  const isSelected = selectedIds.has(tech.id);
                  return (
                    <CommandItem
                      key={tech.id}
                      value={tech.name}
                      onSelect={() => {
                        if (!isSelected) {
                          onAddTechnician(tech);
                        }
                      }}
                      disabled={isSelected}
                      className={cn(isSelected && 'opacity-60 cursor-default')}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4 shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <Wrench className="mr-2 size-4 shrink-0 text-muted-foreground" />
                      {tech.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected technician chips */}
      {selectedTechnicians.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTechnicians.map((tech) => (
            <button
              key={tech.id}
              type="button"
              onClick={() => onToggleTechnician(tech.id)}
              aria-label={t('invoice.technicians.toggle')}
              className={cn(
                'group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                tech.active
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border border-border bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {tech.active && <Check className="size-3.5" />}
              {tech.name}
              <span
                role="button"
                tabIndex={-1}
                aria-label={t('invoice.technicians.remove')}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTechnician(tech.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onRemoveTechnician(tech.id);
                  }
                }}
                className="ml-0.5 rounded-full p-0.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Add new technician inline */}
      <div className="flex gap-2">
        <Input
          placeholder={t('invoice.technicians.addPlaceholder')}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddNew();
            }
          }}
          className="flex-1"
        />
        <PrimaryButton
          type="button"
          onClick={handleAddNew}
          disabled={!newName.trim()}
          className="h-10 shrink-0"
        >
          {t('invoice.technicians.add')}
        </PrimaryButton>
      </div>

      {/* Save-to-table confirmation dialog */}
      <Dialog
        open={pendingName !== null}
        onOpenChange={(open) => {
          if (!open) handleSkipSave();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('invoice.technicians.saveToTable.title')}
            </DialogTitle>
            <DialogDescription>
              {t('invoice.technicians.saveToTable.description', {
                name: pendingName ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton type="button" onClick={handleSkipSave}>
              {t('invoice.technicians.saveToTable.skip')}
            </SecondaryButton>
            <PrimaryButton type="button" onClick={handleSaveToTable}>
              {t('invoice.technicians.saveToTable.confirm')}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

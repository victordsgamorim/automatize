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
import type { WarrantyOption } from '../../InvoiceFormScreen.types';

const DEFAULT_WARRANTY_OPTIONS: WarrantyOption[] = [
  { id: '1m', label: 'invoice.warranty.1m', months: 1 },
  { id: '2m', label: 'invoice.warranty.2m', months: 2 },
  { id: '3m', label: 'invoice.warranty.3m', months: 3 },
  { id: '6m', label: 'invoice.warranty.6m', months: 6 },
  { id: '12m', label: 'invoice.warranty.12m', months: 12 },
];

export interface WarrantySectionProps {
  warrantyMonths: number;
  onWarrantyChange: (months: number) => void;
  additionalInfo: string;
  onAdditionalInfoChange: (info: string) => void;
  warrantyOptions?: WarrantyOption[];
  onAddWarrantyOption?: (label: string, months: number) => void;
}

export const WarrantySection: React.FC<WarrantySectionProps> = ({
  warrantyMonths,
  onWarrantyChange,
  additionalInfo,
  onAdditionalInfoChange,
  warrantyOptions,
  onAddWarrantyOption,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newMonths, setNewMonths] = useState('');

  const options = warrantyOptions ?? DEFAULT_WARRANTY_OPTIONS;

  const selectedOption = options.find((o) => o.months === warrantyMonths);

  const displayLabel = selectedOption
    ? options === DEFAULT_WARRANTY_OPTIONS
      ? t(selectedOption.label)
      : selectedOption.label
    : null;

  const getOptionLabel = (option: WarrantyOption) =>
    options === DEFAULT_WARRANTY_OPTIONS ? t(option.label) : option.label;

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setAddMode(false);
      setNewLabel('');
      setNewMonths('');
    }
  };

  const handleSelect = (option: WarrantyOption) => {
    onWarrantyChange(option.months === warrantyMonths ? 0 : option.months);
    setOpen(false);
  };

  const handleAddOption = () => {
    const trimmedLabel = newLabel.trim();
    const parsedMonths = parseInt(newMonths, 10);
    if (!trimmedLabel || isNaN(parsedMonths) || parsedMonths <= 0) return;
    onAddWarrantyOption?.(trimmedLabel, parsedMonths);
    onWarrantyChange(parsedMonths);
    setNewLabel('');
    setNewMonths('');
    setAddMode(false);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Warranty dropdown */}
      <div className="space-y-2">
        <Text variant="bodySmall" color="muted">
          {t('invoice.warranty')}
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
                !displayLabel && 'text-muted-foreground'
              )}
            >
              {displayLabel ?? t('invoice.warranty.placeholder')}
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
                  {t('invoice.warranty.addNew')}
                </Text>
                <Input
                  label={t('invoice.warranty.new.label')}
                  placeholder={t('invoice.warranty.new.labelPlaceholder')}
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setAddMode(false);
                      setNewLabel('');
                      setNewMonths('');
                    }
                  }}
                />
                <Input
                  label={t('invoice.warranty.new.months')}
                  placeholder={t('invoice.warranty.new.monthsPlaceholder')}
                  value={newMonths}
                  onChange={(e) =>
                    setNewMonths(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  inputMode="numeric"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setAddMode(false);
                      setNewLabel('');
                      setNewMonths('');
                    }
                  }}
                />
                <div className="flex gap-2 justify-end">
                  <SecondaryButton
                    type="button"
                    size="sm"
                    onClick={() => {
                      setAddMode(false);
                      setNewLabel('');
                      setNewMonths('');
                    }}
                  >
                    {t('invoice.cancel')}
                  </SecondaryButton>
                  <PrimaryButton
                    type="button"
                    size="sm"
                    onClick={handleAddOption}
                    disabled={!newLabel.trim() || !newMonths.trim()}
                  >
                    {t('invoice.warranty.add')}
                  </PrimaryButton>
                </div>
              </div>
            ) : (
              <Command>
                <CommandInput placeholder={t('invoice.warranty.search')} />
                <CommandList>
                  <CommandEmpty>{t('invoice.warranty.empty')}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.id}
                        value={getOptionLabel(option)}
                        onSelect={() => handleSelect(option)}
                      >
                        <Check
                          className={cn(
                            'mr-2 size-4',
                            warrantyMonths === option.months
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {getOptionLabel(option)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {onAddWarrantyOption && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem onSelect={() => setAddMode(true)}>
                          <Plus className="mr-2 size-4" />
                          {t('invoice.warranty.addNew')}
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

      {/* Additional info textarea */}
      <div className="space-y-2">
        <Text variant="bodySmall" color="muted">
          {t('invoice.additionalInfo')}
        </Text>
        <textarea
          value={additionalInfo}
          onChange={(e) => onAdditionalInfoChange(e.target.value)}
          placeholder={t('invoice.additionalInfo.placeholder')}
          rows={4}
          className={cn(
            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'resize-none disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
      </div>
    </div>
  );
};

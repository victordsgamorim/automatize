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
import type { Company } from '../../ProductFormScreen.types';

export interface CompanySectionProps {
  companies: Company[];
  selectedCompanyId?: string;
  onCompanySelect: (companyId: string | undefined) => void;
  onAddCompany?: (name: string) => void;
}

export const CompanySection: React.FC<CompanySectionProps> = ({
  companies,
  selectedCompanyId,
  onCompanySelect,
  onAddCompany,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setAddMode(false);
      setNewCompanyName('');
    }
  };

  const handleSelect = (companyId: string) => {
    onCompanySelect(companyId === selectedCompanyId ? undefined : companyId);
    setOpen(false);
  };

  const handleAddCompany = () => {
    const trimmed = newCompanyName.trim();
    if (!trimmed) return;
    onAddCompany?.(trimmed);
    setNewCompanyName('');
    setAddMode(false);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Text variant="bodySmall" color="muted">
        {t('product.company')}
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
              !selectedCompany && 'text-muted-foreground'
            )}
          >
            {selectedCompany
              ? selectedCompany.name
              : t('product.company.placeholder')}
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
                {t('product.company.new')}
              </Text>
              <Input
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder={t('product.company.new.placeholder')}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCompany();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setAddMode(false);
                    setNewCompanyName('');
                  }
                }}
              />
              <div className="flex gap-2 justify-end">
                <SecondaryButton
                  type="button"
                  size="sm"
                  onClick={() => {
                    setAddMode(false);
                    setNewCompanyName('');
                  }}
                >
                  {t('product.cancel')}
                </SecondaryButton>
                <PrimaryButton
                  type="button"
                  size="sm"
                  onClick={handleAddCompany}
                  disabled={!newCompanyName.trim()}
                >
                  {t('product.company.add')}
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <Command>
              <CommandInput placeholder={t('product.company.search')} />
              <CommandList>
                <CommandEmpty>{t('product.company.empty')}</CommandEmpty>
                <CommandGroup>
                  {companies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.name}
                      onSelect={() => handleSelect(company.id)}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4',
                          selectedCompanyId === company.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {company.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
                {onAddCompany && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem onSelect={() => setAddMode(true)}>
                        <Plus className="mr-2 size-4" />
                        {t('product.company.addNew')}
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

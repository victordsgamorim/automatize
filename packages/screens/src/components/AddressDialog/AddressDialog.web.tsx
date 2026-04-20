import React from 'react';
import { House, Building2 } from 'lucide-react';
import {
  PrimaryButton,
  SecondaryButton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  Input,
  Text,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  cn,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import type { AddressFields } from './useAddressDialog';

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'AP', label: 'Amapa' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceara' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espirito Santo' },
  { value: 'GO', label: 'Goias' },
  { value: 'MA', label: 'Maranhao' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'PA', label: 'Para' },
  { value: 'PB', label: 'Paraiba' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piaui' },
  { value: 'PR', label: 'Parana' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RO', label: 'Rondonia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'SP', label: 'Sao Paulo' },
  { value: 'TO', label: 'Tocantins' },
] as const;

export interface AddressDialogProps<T extends AddressFields> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: T;
  onChange: (data: T) => void;
  onSave: () => void;
  editingId: string | null;
  variant?: 'tabs' | 'buttons';
  title: string;
  description?: string;
  saveLabel: string;
}

export function AddressDialog<T extends AddressFields>({
  open,
  onOpenChange,
  data,
  onChange,
  onSave,
  editingId: _editingId,
  variant = 'tabs',
  title,
  description,
  saveLabel,
}: AddressDialogProps<T>): React.ReactElement {
  const { t } = useTranslation();

  const set = (patch: Partial<AddressFields>): void => {
    onChange({ ...data, ...patch } as T);
  };

  const addressTypeToggle =
    variant === 'tabs' ? (
      <Tabs
        value={data.addressType ?? 'residence'}
        onValueChange={(val) =>
          set({ addressType: val as AddressFields['addressType'] })
        }
      >
        <TabsList variant="default" size="sm">
          <TabsTrigger value="residence">
            <House className="size-3.5" />
            {t('client.address.type.residence')}
          </TabsTrigger>
          <TabsTrigger value="establishment">
            <Building2 className="size-3.5" />
            {t('client.address.type.establishment')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    ) : (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => set({ addressType: 'residence' })}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
            data.addressType === 'residence'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:bg-muted/30'
          )}
        >
          <House className="size-4" />
          {t('client.address.type.residence')}
        </button>
        <button
          type="button"
          onClick={() => set({ addressType: 'establishment' })}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
            data.addressType === 'establishment'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:bg-muted/30'
          )}
        >
          <Building2 className="size-4" />
          {t('client.address.type.establishment')}
        </button>
      </div>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div
          className="space-y-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && data.street.trim()) {
              e.preventDefault();
              e.stopPropagation();
              onSave();
            }
          }}
        >
          {addressTypeToggle}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <Input
                id="address-dialog-street"
                label={t('client.address.street')}
                placeholder={t('client.address.street.placeholder')}
                value={data.street}
                onChange={(e) => set({ street: e.target.value })}
                autoFocus
              />
            </div>
            <Input
              id="address-dialog-number"
              label={t('client.address.number')}
              placeholder={t('client.address.number.placeholder')}
              value={data.number}
              onChange={(e) => set({ number: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="address-dialog-neighborhood"
              label={t('client.address.neighborhood')}
              placeholder={t('client.address.neighborhood.placeholder')}
              value={data.neighborhood}
              onChange={(e) => set({ neighborhood: e.target.value })}
            />
            <Input
              id="address-dialog-city"
              label={t('client.address.city')}
              placeholder={t('client.address.city.placeholder')}
              value={data.city}
              onChange={(e) => set({ city: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Text
                htmlFor="address-dialog-state"
                color="muted"
                className="pl-3"
              >
                {t('client.address.state')}
              </Text>
              <Select
                value={data.state}
                onValueChange={(val) => set({ state: val })}
              >
                <SelectTrigger id="address-dialog-state">
                  <SelectValue
                    placeholder={t('client.address.state.placeholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              id="address-dialog-info"
              label={t('client.address.info')}
              placeholder={t('client.address.info.placeholder')}
              value={data.info ?? ''}
              onChange={(e) => set({ info: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            shortcut="Esc"
          >
            {t('app.cancel')}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={onSave}
            disabled={!data.street.trim()}
            shortcut="Enter"
          >
            {saveLabel}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

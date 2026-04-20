import React, { useState } from 'react';
import {
  Check,
  ChevronsUpDown,
  X,
  MapPin,
  Phone,
  Plus,
  Home,
  Building2,
  Smartphone,
} from 'lucide-react';
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
  Text,
  Separator,
  SecondaryChip,
  cn,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import type {
  ClientRow,
  ClientAddress,
  ClientPhone,
} from '../../InvoiceFormScreen.types';
import { AddressDialog } from '../../../components/AddressDialog/AddressDialog.web';
import { useAddressDialog } from '../../../components/AddressDialog/useAddressDialog';
import { PhoneDialog } from '../../../components/PhoneDialog/PhoneDialog.web';
import { usePhoneDialog } from '../../../components/PhoneDialog/usePhoneDialog';
import { SaveToProfileDialog } from '../../../components/SaveToProfileDialog/SaveToProfileDialog.web';

type EmptyAddress = Omit<ClientAddress, 'id'>;
type EmptyPhone = Omit<ClientPhone, 'id'>;

const EMPTY_ADDRESS: EmptyAddress = {
  addressType: 'residence',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  info: '',
};

const EMPTY_PHONE: EmptyPhone = {
  phoneType: 'mobile',
  number: '',
};

function formatAddressShort(addr: ClientAddress): string {
  return [addr.street, addr.number, addr.city].filter(Boolean).join(', ');
}

function formatAddressFull(addr: ClientAddress): string {
  const parts = [
    [addr.street, addr.number].filter(Boolean).join(', '),
    addr.neighborhood,
    addr.city,
    addr.state,
  ].filter(Boolean);
  if (addr.info) parts.push(addr.info);
  return parts.join(' · ');
}

export interface ClientSectionProps {
  availableClients: ClientRow[];
  selectedClientId?: string;
  selectedClientName?: string;
  clientAddresses: ClientAddress[];
  clientPhones: ClientPhone[];
  onSelectClient: (client: ClientRow) => void;
  onClearClient: () => void;
  onSelectAddress: (address: ClientAddress) => void;
  onAddAddress: (data: EmptyAddress) => void;
  onRemoveAddress: (id: string) => void;
  onTogglePhone: (phone: ClientPhone) => void;
  onAddPhone: (data: EmptyPhone) => void;
  onRemovePhone: (id: string) => void;
  onSaveAddressToClient?: (address: ClientAddress) => void;
  onSavePhoneToClient?: (phone: ClientPhone) => void;
}

export const ClientSection: React.FC<ClientSectionProps> = ({
  availableClients,
  selectedClientId,
  selectedClientName,
  clientAddresses,
  clientPhones,
  onSelectClient,
  onClearClient,
  onSelectAddress,
  onAddAddress,
  onRemoveAddress,
  onTogglePhone,
  onAddPhone,
  onRemovePhone,
  onSaveAddressToClient,
  onSavePhoneToClient,
}) => {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);

  const addressDialog = useAddressDialog<EmptyAddress>(EMPTY_ADDRESS);
  const phoneDialog = usePhoneDialog<EmptyPhone>(EMPTY_PHONE);

  const [pendingAddress, setPendingAddress] = useState<ClientAddress | null>(
    null
  );
  const [saveAddressDialogOpen, setSaveAddressDialogOpen] = useState(false);

  const [pendingPhone, setPendingPhone] = useState<ClientPhone | null>(null);
  const [savePhoneDialogOpen, setSavePhoneDialogOpen] = useState(false);

  const selectedClient = availableClients.find(
    (c) => c.id === selectedClientId
  );
  const savedAddresses: ClientAddress[] = selectedClient?.addresses ?? [];
  const savedPhones: ClientPhone[] = selectedClient?.phones ?? [];

  const savedPhoneNumbers = new Set(savedPhones.map((p) => p.number));
  const allDropdownPhones: ClientPhone[] = [
    ...savedPhones,
    ...clientPhones.filter((p) => !savedPhoneNumbers.has(p.number)),
  ];
  const chipPhones = clientPhones;

  const currentAddress: ClientAddress | null = clientAddresses[0] ?? null;

  const handleSelectClient = (client: ClientRow) => {
    onSelectClient(client);
    setOpen(false);
  };

  // ── Address flow ────────────────────────────────────────────────────────────

  const handleAddressSave = () => {
    if (!addressDialog.data.street.trim()) return;
    const created: ClientAddress = {
      id: `pending-${Date.now()}`,
      ...addressDialog.data,
    };
    setPendingAddress(created);
    addressDialog.close();
    setSaveAddressDialogOpen(true);
  };

  const handleSaveAddressToProfile = () => {
    if (!pendingAddress) return;
    onSaveAddressToClient?.(pendingAddress);
    onAddAddress({ ...pendingAddress });
    setPendingAddress(null);
    setSaveAddressDialogOpen(false);
  };

  const handleSkipSaveAddress = () => {
    if (!pendingAddress) return;
    onAddAddress({ ...pendingAddress });
    setPendingAddress(null);
    setSaveAddressDialogOpen(false);
  };

  // ── Phone flow ──────────────────────────────────────────────────────────────

  const handlePhoneSave = () => {
    if (!phoneDialog.data.number.trim()) return;
    const created: ClientPhone = {
      id: `pending-${Date.now()}`,
      ...phoneDialog.data,
    };
    setPendingPhone(created);
    phoneDialog.close();
    setSavePhoneDialogOpen(true);
  };

  const handleSavePhoneToProfile = () => {
    if (!pendingPhone) return;
    onSavePhoneToClient?.(pendingPhone);
    onTogglePhone(pendingPhone);
    setPendingPhone(null);
    setSavePhoneDialogOpen(false);
  };

  const handleSkipSavePhone = () => {
    if (!pendingPhone) return;
    onAddPhone({ ...pendingPhone });
    setPendingPhone(null);
    setSavePhoneDialogOpen(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <Text variant="bodySmall" color="muted">
        {t('invoice.client')}
      </Text>

      {/* Client selector */}
      {!selectedClientId ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={open}
              className={cn(
                'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
                'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'text-muted-foreground'
              )}
            >
              {t('invoice.client.placeholder')}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            style={{ width: 'var(--radix-popover-trigger-width)' }}
            align="start"
          >
            <Command>
              <CommandInput placeholder={t('invoice.client.search')} />
              <CommandList>
                <CommandEmpty>{t('invoice.client.empty')}</CommandEmpty>
                <CommandGroup>
                  {availableClients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.name}
                      onSelect={() => handleSelectClient(client)}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4',
                          selectedClientId === client.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {client.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
        /* Selected client card */
        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
          {/* Client name + clear */}
          <div className="flex items-center justify-between">
            <Text variant="body" className="font-semibold">
              {selectedClientName}
            </Text>
            <button
              type="button"
              onClick={onClearClient}
              aria-label={t('invoice.client.clear')}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <Separator />

          {/* ── Addresses ──────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <Text variant="label">{t('invoice.client.addresses')}</Text>
              </div>
              <button
                type="button"
                onClick={() => addressDialog.openNew()}
                disabled={!!currentAddress}
                className={cn(
                  'flex items-center gap-1 text-xs',
                  currentAddress
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : 'text-primary hover:underline'
                )}
              >
                <Plus className="size-3" />
                {t('invoice.client.address.add')}
              </button>
            </div>

            {savedAddresses.length > 0 && (
              <div className="flex items-center gap-1">
                <Popover open={addressOpen} onOpenChange={setAddressOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      role="combobox"
                      aria-expanded={addressOpen}
                      className={cn(
                        'flex h-10 flex-1 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
                        'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        currentAddress
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      <span className="flex items-center gap-2 truncate min-w-0">
                        {currentAddress &&
                          (currentAddress.addressType === 'establishment' ? (
                            <Building2 className="size-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <Home className="size-4 shrink-0 text-muted-foreground" />
                          ))}
                        <span className="truncate">
                          {currentAddress
                            ? formatAddressShort(currentAddress)
                            : t('invoice.client.address.select')}
                        </span>
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
                      <CommandInput
                        placeholder={t('invoice.client.address.search')}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t('invoice.client.address.noSaved')}
                        </CommandEmpty>
                        <CommandGroup>
                          {savedAddresses.map((addr) => {
                            const isSelected = currentAddress?.id === addr.id;
                            const AddrIcon =
                              addr.addressType === 'establishment'
                                ? Building2
                                : Home;
                            return (
                              <CommandItem
                                key={addr.id}
                                value={formatAddressShort(addr)}
                                onSelect={() => {
                                  onSelectAddress(addr);
                                  setAddressOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 size-4 shrink-0',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                <AddrIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0">
                                  <div className="text-sm truncate">
                                    {formatAddressShort(addr)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {t(
                                      addr.addressType === 'establishment'
                                        ? 'client.address.type.establishment'
                                        : 'client.address.type.residence'
                                    )}
                                  </div>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {currentAddress && (
                  <button
                    type="button"
                    onClick={() => onRemoveAddress(currentAddress.id)}
                    aria-label={t('client.address.remove')}
                    className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            )}

            {savedAddresses.length === 0 && currentAddress && (
              <div className="flex items-start gap-2 rounded-md border border-border bg-background p-2.5">
                {currentAddress.addressType === 'establishment' ? (
                  <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Home className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                )}
                <Text variant="bodySmall" className="flex-1 text-foreground/80">
                  {formatAddressFull(currentAddress)}
                </Text>
                <button
                  type="button"
                  onClick={() => onRemoveAddress(currentAddress.id)}
                  aria-label={t('client.address.remove')}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {!currentAddress && savedAddresses.length === 0 && (
              <Text variant="caption" className="text-muted-foreground">
                {t('invoice.client.noAddresses')}
              </Text>
            )}
          </div>

          <Separator />

          {/* ── Phones ─────────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <Text variant="label">{t('invoice.client.phones')}</Text>
              </div>
              <button
                type="button"
                onClick={() => phoneDialog.openNew()}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="size-3" />
                {t('invoice.client.phone.add')}
              </button>
            </div>

            {allDropdownPhones.length > 0 && (
              <Popover open={phoneOpen} onOpenChange={setPhoneOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={phoneOpen}
                    className={cn(
                      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
                      'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      clientPhones.length > 0
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    <span className="truncate">
                      {clientPhones.length > 0
                        ? t('invoice.client.phone.selected', {
                            count: String(clientPhones.length),
                          })
                        : t('invoice.client.phone.select')}
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
                    <CommandInput
                      placeholder={t('invoice.client.phone.search')}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {t('invoice.client.phone.noSaved')}
                      </CommandEmpty>
                      <CommandGroup>
                        {allDropdownPhones.map((phone) => {
                          const isSelected = clientPhones.some(
                            (p) => p.number === phone.number
                          );
                          const PhoneIcon =
                            phone.phoneType === 'mobile' ? Smartphone : Phone;
                          return (
                            <CommandItem
                              key={phone.id}
                              value={phone.number}
                              onSelect={() => onTogglePhone(phone)}
                            >
                              <Check
                                className={cn(
                                  'mr-2 size-4 shrink-0',
                                  isSelected ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <PhoneIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
                              <div className="min-w-0">
                                <div className="text-sm">{phone.number}</div>
                                <div className="text-xs text-muted-foreground">
                                  {t(
                                    phone.phoneType === 'mobile'
                                      ? 'client.phone.type.mobile'
                                      : 'client.phone.type.telephone'
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            {chipPhones.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {chipPhones.map((phone) => {
                  const PhoneIcon =
                    phone.phoneType === 'mobile' ? Smartphone : Phone;
                  return (
                    <SecondaryChip
                      key={phone.id}
                      size="lg"
                      onRemove={() => onRemovePhone(phone.id)}
                    >
                      <PhoneIcon className="size-3" />
                      {phone.number}
                    </SecondaryChip>
                  );
                })}
              </div>
            )}

            {clientPhones.length === 0 && savedPhones.length === 0 && (
              <Text variant="caption" className="text-muted-foreground">
                {t('invoice.client.noPhones')}
              </Text>
            )}
          </div>
        </div>
      )}

      {/* ── Address Dialog ──────────────────────────────────────────────────── */}
      <AddressDialog
        open={addressDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) addressDialog.close();
        }}
        data={addressDialog.data}
        onChange={addressDialog.setData}
        onSave={handleAddressSave}
        editingId={addressDialog.editingId}
        variant="tabs"
        title={t('invoice.client.address.dialog.title')}
        description={t('client.address.add')}
        saveLabel={t('invoice.client.address.save')}
      />

      {/* Save Address to Profile Dialog */}
      <SaveToProfileDialog
        open={saveAddressDialogOpen}
        onConfirm={handleSaveAddressToProfile}
        onSkip={handleSkipSaveAddress}
        title={t('invoice.client.address.saveToClient.title')}
        description={t('invoice.client.address.saveToClient.description')}
        confirmLabel={t('invoice.client.address.saveToClient.yes')}
        skipLabel={t('invoice.client.address.saveToClient.no')}
      />

      {/* ── Phone Dialog ────────────────────────────────────────────────────── */}
      <PhoneDialog
        open={phoneDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) phoneDialog.close();
        }}
        data={phoneDialog.data}
        onChange={phoneDialog.setData}
        onSave={handlePhoneSave}
        editingId={phoneDialog.editingId}
        variant="tabs"
        title={t('invoice.client.phone.dialog.title')}
        description={t('client.phone.add')}
        saveLabel={t('invoice.client.phone.save')}
      />

      {/* Save Phone to Profile Dialog */}
      <SaveToProfileDialog
        open={savePhoneDialogOpen}
        onConfirm={handleSavePhoneToProfile}
        onSkip={handleSkipSavePhone}
        title={t('invoice.client.phone.saveToClient.title')}
        description={t('invoice.client.phone.saveToClient.description')}
        confirmLabel={t('invoice.client.phone.saveToClient.yes')}
        skipLabel={t('invoice.client.phone.saveToClient.no')}
      />
    </div>
  );
};

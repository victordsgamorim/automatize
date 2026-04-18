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
  Separator,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  cn,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import type {
  ClientRow,
  ClientAddress,
  ClientPhone,
} from '../../InvoiceFormScreen.types';

const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

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

  // Client selector
  const [open, setOpen] = useState(false);

  // Address dropdown
  const [addressOpen, setAddressOpen] = useState(false);

  // Phone dropdown
  const [phoneOpen, setPhoneOpen] = useState(false);

  // Address dialog
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<EmptyAddress>(EMPTY_ADDRESS);
  const [pendingAddress, setPendingAddress] = useState<ClientAddress | null>(
    null
  );
  const [saveAddressDialogOpen, setSaveAddressDialogOpen] = useState(false);

  // Phone dialog
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [newPhone, setNewPhone] = useState<EmptyPhone>(EMPTY_PHONE);
  const [pendingPhone, setPendingPhone] = useState<ClientPhone | null>(null);
  const [savePhoneDialogOpen, setSavePhoneDialogOpen] = useState(false);

  // Derive saved lists from the selected client
  const selectedClient = availableClients.find(
    (c) => c.id === selectedClientId
  );
  const savedAddresses: ClientAddress[] = selectedClient?.addresses ?? [];
  const savedPhones: ClientPhone[] = selectedClient?.phones ?? [];

  // The currently selected address (0 or 1)
  const currentAddress: ClientAddress | null = clientAddresses[0] ?? null;

  // ── Client selection ────────────────────────────────────────────────────────

  const handleSelectClient = (client: ClientRow) => {
    onSelectClient(client);
    setOpen(false);
  };

  // ── Address flow ────────────────────────────────────────────────────────────

  const handleAddressDialogClose = () => {
    setAddressDialogOpen(false);
    setNewAddress(EMPTY_ADDRESS);
  };

  const handleAddressSave = () => {
    if (!newAddress.street.trim()) return;
    const created: ClientAddress = {
      id: `pending-${Date.now()}`,
      ...newAddress,
    };
    setPendingAddress(created);
    setAddressDialogOpen(false);
    setNewAddress(EMPTY_ADDRESS);
    if (onSaveAddressToClient) {
      setSaveAddressDialogOpen(true);
    } else {
      onAddAddress(newAddress);
      setPendingAddress(null);
    }
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

  const handlePhoneDialogClose = () => {
    setPhoneDialogOpen(false);
    setNewPhone(EMPTY_PHONE);
  };

  const handlePhoneSave = () => {
    if (!newPhone.number.trim()) return;
    const created: ClientPhone = { id: `pending-${Date.now()}`, ...newPhone };
    setPendingPhone(created);
    setPhoneDialogOpen(false);
    setNewPhone(EMPTY_PHONE);
    if (onSavePhoneToClient) {
      setSavePhoneDialogOpen(true);
    } else {
      onAddPhone(newPhone);
      setPendingPhone(null);
    }
  };

  const handleSavePhoneToProfile = () => {
    if (!pendingPhone) return;
    onSavePhoneToClient?.(pendingPhone);
    onAddPhone({ ...pendingPhone });
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
                onClick={() => setAddressDialogOpen(true)}
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

            {/* Dropdown — only if client has saved addresses */}
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

                {/* Clear selected address */}
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

            {/* Custom address card (when client has no saved addresses) */}
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

            {/* Empty state */}
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
                onClick={() => setPhoneDialogOpen(true)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="size-3" />
                {t('invoice.client.phone.add')}
              </button>
            </div>

            {/* Multi-select dropdown — only if client has saved phones */}
            {savedPhones.length > 0 && (
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
                        {savedPhones.map((phone) => {
                          const isSelected = clientPhones.some(
                            (p) => p.id === phone.id
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

            {/* Selected phones as chips */}
            {clientPhones.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {clientPhones.map((phone) => {
                  const PhoneIcon =
                    phone.phoneType === 'mobile' ? Smartphone : Phone;
                  return (
                    <div
                      key={phone.id}
                      className="group flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1"
                    >
                      <PhoneIcon className="size-3 text-muted-foreground" />
                      <Text variant="bodySmall">{phone.number}</Text>
                      <button
                        type="button"
                        onClick={() => onRemovePhone(phone.id)}
                        aria-label={t('client.phone.remove')}
                        className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {clientPhones.length === 0 && savedPhones.length === 0 && (
              <Text variant="caption" className="text-muted-foreground">
                {t('invoice.client.noPhones')}
              </Text>
            )}
          </div>
        </div>
      )}

      {/* ── Add Address Dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={addressDialogOpen}
        onOpenChange={(v) => {
          if (!v) handleAddressDialogClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('invoice.client.address.dialog.title')}
            </DialogTitle>
          </DialogHeader>
          <div
            className="space-y-3 py-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newAddress.street.trim()) {
                e.preventDefault();
                handleAddressSave();
              }
            }}
          >
            {/* Address type */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setNewAddress((p) => ({ ...p, addressType: 'residence' }))
                }
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                  newAddress.addressType === 'residence'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted/30'
                )}
              >
                <Home className="size-4" />
                {t('client.address.type.residence')}
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewAddress((p) => ({ ...p, addressType: 'establishment' }))
                }
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                  newAddress.addressType === 'establishment'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted/30'
                )}
              >
                <Building2 className="size-4" />
                {t('client.address.type.establishment')}
              </button>
            </div>
            <div className="flex gap-3">
              <div className="flex-[3]">
                <Input
                  label={t('client.address.street')}
                  placeholder={t('client.address.street.placeholder')}
                  value={newAddress.street}
                  onChange={(e) =>
                    setNewAddress((p) => ({ ...p, street: e.target.value }))
                  }
                  autoFocus
                />
              </div>
              <div className="flex-1">
                <Input
                  label={t('client.address.number')}
                  placeholder={t('client.address.number.placeholder')}
                  value={newAddress.number}
                  onChange={(e) =>
                    setNewAddress((p) => ({ ...p, number: e.target.value }))
                  }
                />
              </div>
            </div>
            <Input
              label={t('client.address.neighborhood')}
              placeholder={t('client.address.neighborhood.placeholder')}
              value={newAddress.neighborhood}
              onChange={(e) =>
                setNewAddress((p) => ({ ...p, neighborhood: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('client.address.city')}
                placeholder={t('client.address.city.placeholder')}
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress((p) => ({ ...p, city: e.target.value }))
                }
              />
              <div className="space-y-1">
                <Text variant="label">{t('client.address.state')}</Text>
                <Select
                  value={newAddress.state}
                  onValueChange={(v) =>
                    setNewAddress((p) => ({ ...p, state: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('client.address.state.placeholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Input
              label={t('client.address.info')}
              placeholder={t('client.address.info.placeholder')}
              value={newAddress.info ?? ''}
              onChange={(e) =>
                setNewAddress((p) => ({ ...p, info: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <SecondaryButton type="button" onClick={handleAddressDialogClose}>
              {t('app.cancel')}
            </SecondaryButton>
            <PrimaryButton
              type="button"
              onClick={handleAddressSave}
              disabled={!newAddress.street.trim()}
            >
              {t('invoice.client.address.save')}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Address to Profile Dialog */}
      <Dialog
        open={saveAddressDialogOpen}
        onOpenChange={(v) => {
          if (!v) handleSkipSaveAddress();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('invoice.client.address.saveToClient.title')}
            </DialogTitle>
            <DialogDescription>
              {t('invoice.client.address.saveToClient.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton type="button" onClick={handleSkipSaveAddress}>
              {t('invoice.client.address.saveToClient.no')}
            </SecondaryButton>
            <PrimaryButton type="button" onClick={handleSaveAddressToProfile}>
              {t('invoice.client.address.saveToClient.yes')}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Phone Dialog ────────────────────────────────────────────────── */}
      <Dialog
        open={phoneDialogOpen}
        onOpenChange={(v) => {
          if (!v) handlePhoneDialogClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('invoice.client.phone.dialog.title')}</DialogTitle>
          </DialogHeader>
          <div
            className="space-y-3 py-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newPhone.number.trim()) {
                e.preventDefault();
                handlePhoneSave();
              }
            }}
          >
            {/* Phone type */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setNewPhone((p) => ({ ...p, phoneType: 'mobile' }))
                }
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                  newPhone.phoneType === 'mobile'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted/30'
                )}
              >
                <Smartphone className="size-4" />
                {t('client.phone.type.mobile')}
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewPhone((p) => ({ ...p, phoneType: 'telephone' }))
                }
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                  newPhone.phoneType === 'telephone'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted/30'
                )}
              >
                <Phone className="size-4" />
                {t('client.phone.type.telephone')}
              </button>
            </div>
            <Input
              label={t('client.phone.label')}
              placeholder={t('client.phone.placeholder')}
              value={newPhone.number}
              onChange={(e) =>
                setNewPhone((p) => ({ ...p, number: e.target.value }))
              }
              autoFocus
            />
          </div>
          <DialogFooter>
            <SecondaryButton type="button" onClick={handlePhoneDialogClose}>
              {t('app.cancel')}
            </SecondaryButton>
            <PrimaryButton
              type="button"
              onClick={handlePhoneSave}
              disabled={!newPhone.number.trim()}
            >
              {t('invoice.client.phone.save')}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Phone to Profile Dialog */}
      <Dialog
        open={savePhoneDialogOpen}
        onOpenChange={(v) => {
          if (!v) handleSkipSavePhone();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('invoice.client.phone.saveToClient.title')}
            </DialogTitle>
            <DialogDescription>
              {t('invoice.client.phone.saveToClient.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton type="button" onClick={handleSkipSavePhone}>
              {t('invoice.client.phone.saveToClient.no')}
            </SecondaryButton>
            <PrimaryButton type="button" onClick={handleSavePhoneToProfile}>
              {t('invoice.client.phone.saveToClient.yes')}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

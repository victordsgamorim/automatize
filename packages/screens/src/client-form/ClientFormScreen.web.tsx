import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Input,
  Text,
  Card,
  Separator,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  RadioGroup,
  RadioGroupItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { formatCpf, formatCnpj } from '@automatize/form-validator';
import type { ClientFormScreenProps, Address } from './ClientFormScreen.types';
import { useClientForm } from './useClientForm';

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

const MAX_VISIBLE_ADDRESSES = 5;

type NewAddressFields = Omit<Address, 'id'>;

function getAddressDisplayLines(address: Address): string[] {
  const lines: string[] = [];
  const streetNumber = [address.street, address.number]
    .filter(Boolean)
    .join(', ');
  if (streetNumber) lines.push(streetNumber);
  if (address.neighborhood) lines.push(address.neighborhood);
  const cityState = [address.city, address.state].filter(Boolean).join(' - ');
  if (cityState) lines.push(cityState);
  if (address.info) lines.push(address.info);
  return lines;
}

const EMPTY_ADDRESS: NewAddressFields = {
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  info: '',
};

export const ClientFormScreen: React.FC<ClientFormScreenProps> = ({
  onSubmit,
  initialData,
  onDataChange,
  onBack,
  showDiscardDialog,
  onDiscardCancel,
}) => {
  const { t } = useTranslation();
  const {
    clientType,
    setClientType,
    name,
    setName,
    document,
    setDocument,
    addresses,
    addAddress,
    removeAddress,
    phones,
    addPhone,
    removePhone,
    updatePhone,
    getFormData,
    resetForm,
  } = useClientForm({ initialData, onDataChange });

  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddressFields>(EMPTY_ADDRESS);

  const isControlled = showDiscardDialog !== undefined;
  const dialogOpen = isControlled ? showDiscardDialog : internalDialogOpen;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(getFormData());
  };

  const hasFormData =
    name.trim() !== '' ||
    document.trim() !== '' ||
    addresses.some(
      (a) =>
        a.street.trim() !== '' ||
        a.number.trim() !== '' ||
        a.neighborhood.trim() !== '' ||
        a.city.trim() !== '' ||
        a.state.trim() !== '' ||
        a.info.trim() !== ''
    ) ||
    phones.some((p) => p.number.trim() !== '');

  useEffect(() => {
    if (!hasFormData) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasFormData]);

  const handleConfirmDiscard = () => {
    if (isControlled) {
      onBack?.();
    } else {
      setInternalDialogOpen(false);
      onBack?.();
    }
  };

  const handleCancelDiscard = () => {
    if (isControlled) {
      onDiscardCancel?.();
    } else {
      setInternalDialogOpen(false);
      onDiscardCancel?.();
    }
  };

  const handleOpenAddressDialog = () => {
    setNewAddress(EMPTY_ADDRESS);
    setAddressDialogOpen(true);
  };

  const handleSaveAddress = () => {
    addAddress(newAddress);
    setAddressDialogOpen(false);
  };

  const visibleAddresses = addresses.slice(0, MAX_VISIBLE_ADDRESSES);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Card padding="lg">
        <div className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Client Type */}
            <div className="space-y-2">
              <Text variant="bodySmall" color="muted">
                {t('client.type')}
              </Text>
              <RadioGroup
                value={clientType}
                onValueChange={(val) =>
                  setClientType(val as 'individual' | 'business')
                }
                orientation="horizontal"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="individual" />
                  <Text variant="body">{t('client.type.individual')}</Text>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="business" />
                  <Text variant="body">{t('client.type.business')}</Text>
                </label>
              </RadioGroup>
            </div>

            {/* Name */}
            <Input
              id="client-name"
              name="name"
              label={t('client.name')}
              placeholder={t('client.name.placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* CPF / CNPJ */}
            <Input
              id="client-document"
              name="document"
              label={
                clientType === 'individual' ? t('client.cpf') : t('client.cnpj')
              }
              placeholder={
                clientType === 'individual'
                  ? '000.000.000-00'
                  : '00.000.000/0000-00'
              }
              value={document}
              onChange={(e) => {
                const formatted =
                  clientType === 'individual'
                    ? formatCpf(e.target.value)
                    : formatCnpj(e.target.value);
                setDocument(formatted);
              }}
              maxLength={clientType === 'individual' ? 14 : 18}
            />

            <Separator />

            {/* Addresses Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Text variant="h3">{t('client.addresses')}</Text>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleOpenAddressDialog}
                  aria-label={t('client.address.add')}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              {visibleAddresses.length === 0 ? (
                <Text
                  variant="bodySmall"
                  color="muted"
                  className="text-center py-4"
                >
                  {t('client.address.empty')}
                </Text>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {visibleAddresses.map((address) => (
                    <Card
                      key={address.id}
                      padding="sm"
                      className="relative group min-h-[80px]"
                    >
                      <div className="space-y-0.5 pr-6">
                        {getAddressDisplayLines(address).length > 0 ? (
                          getAddressDisplayLines(address).map((line, i) => (
                            <Text
                              key={i}
                              variant={i === 0 ? 'bodySmall' : 'caption'}
                              color={i === 0 ? 'primary' : 'muted'}
                              className="line-clamp-1"
                            >
                              {line}
                            </Text>
                          ))
                        ) : (
                          <Text variant="bodySmall" color="muted">
                            —
                          </Text>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeAddress(address.id)}
                        aria-label={t('client.address.remove')}
                      >
                        <Trash2 className="size-3 text-muted-foreground" />
                      </Button>
                    </Card>
                  ))}
                  {addresses.length >= MAX_VISIBLE_ADDRESSES + 1 && (
                    <div className="flex items-center justify-center min-h-[80px]">
                      <Button type="button" variant="link">
                        {t('client.address.viewAll')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Phones Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Text variant="h3">{t('client.phones')}</Text>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addPhone}
                  aria-label={t('client.phone.add')}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              {phones.map((phone, index) => (
                <div key={phone.id} className="space-y-1.5">
                  <Text
                    htmlFor={`phone-${phone.id}`}
                    color="muted"
                    className="pl-3"
                  >
                    {`${t('client.phone.label')} ${index + 1}`}
                  </Text>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        id={`phone-${phone.id}`}
                        placeholder={t('client.phone.placeholder')}
                        value={phone.number}
                        onChange={(e) => updatePhone(phone.id, e.target.value)}
                      />
                    </div>
                    {phones.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePhone(phone.id)}
                        aria-label={t('client.phone.remove')}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Submit */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="destructive" onClick={resetForm}>
                {t('client.reset')}
              </Button>
              <Button type="submit">{t('client.submit')}</Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Discard confirmation dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open && !isControlled) {
            handleCancelDiscard();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('client.discard.title')}</DialogTitle>
            <DialogDescription>
              {t('client.discard.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDiscard}
            >
              {t('client.discard.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDiscard}
            >
              {t('client.discard.continue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address creation dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('client.address.dialog.title')}</DialogTitle>
            <DialogDescription>{t('client.address.add')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <Input
                  id="new-address-street"
                  label={t('client.address.street')}
                  placeholder={t('client.address.street.placeholder')}
                  value={newAddress.street}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      street: e.target.value,
                    }))
                  }
                />
              </div>
              <Input
                id="new-address-number"
                label={t('client.address.number')}
                placeholder={t('client.address.number.placeholder')}
                value={newAddress.number}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    number: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="new-address-neighborhood"
                label={t('client.address.neighborhood')}
                placeholder={t('client.address.neighborhood.placeholder')}
                value={newAddress.neighborhood}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    neighborhood: e.target.value,
                  }))
                }
              />
              <Input
                id="new-address-city"
                label={t('client.address.city')}
                placeholder={t('client.address.city.placeholder')}
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Text
                  htmlFor="new-address-state"
                  color="muted"
                  className="pl-3"
                >
                  {t('client.address.state')}
                </Text>
                <Select
                  value={newAddress.state}
                  onValueChange={(val) =>
                    setNewAddress((prev) => ({ ...prev, state: val }))
                  }
                >
                  <SelectTrigger
                    id="new-address-state"
                    className="border-border bg-foreground/5 backdrop-blur-sm"
                  >
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
                id="new-address-info"
                label={t('client.address.info')}
                placeholder={t('client.address.info.placeholder')}
                value={newAddress.info}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    info: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddressDialogOpen(false)}
            >
              {t('app.cancel')}
            </Button>
            <Button type="button" onClick={handleSaveAddress}>
              {t('client.address.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

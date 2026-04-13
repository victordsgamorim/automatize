import React from 'react';
import { House, Building2, Trash2, Plus } from 'lucide-react';
import {
  Button,
  Text,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Drawer,
  BottomSheet,
  Tabs,
  TabsList,
  TabsTrigger,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { useResponsive } from '@automatize/ui/responsive';
import type { Address, AddressType } from '../../ClientFormScreen.types';

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

export type NewAddressFields = Omit<Address, 'id'>;

export interface AddressSectionProps {
  addresses: Address[];
  addAddress: (data: NewAddressFields) => void;
  removeAddress: (id: string) => void;
  updateAddress: (
    id: string,
    field: keyof NewAddressFields,
    value: string
  ) => void;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  newAddress: NewAddressFields;
  onNewAddressChange: (
    data: NewAddressFields | ((prev: NewAddressFields) => NewAddressFields)
  ) => void;
  editingAddressId: string | null;
  onEditingAddressIdChange: (id: string | null) => void;
  showAllAddresses: boolean;
  onShowAllAddressesChange: (show: boolean) => void;
  clientType?: 'individual' | 'business';
  isMobile?: boolean;
}

function AddressTypeIcon({
  addressType,
  className = 'size-4 shrink-0 text-muted-foreground',
}: {
  addressType: AddressType;
  className?: string;
}): React.ReactElement {
  return addressType === 'residence' ? (
    <House className={className} />
  ) : (
    <Building2 className={className} />
  );
}

function getAddressDisplayLines(address: Address): string[] {
  const lines: string[] = [];
  const streetNumber = [address.street, address.number]
    .filter((s): s is string => Boolean(s))
    .join(', ');
  if (streetNumber) lines.push(streetNumber);
  if (address.neighborhood) lines.push(address.neighborhood);
  const cityState = [address.city, address.state]
    .filter((s): s is string => Boolean(s))
    .join(' - ');
  if (cityState) lines.push(cityState);
  if (address.info) lines.push(address.info);
  return lines;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  addresses,
  addAddress,
  removeAddress,
  updateAddress,
  isDialogOpen,
  onDialogOpenChange,
  newAddress,
  onNewAddressChange,
  editingAddressId,
  onEditingAddressIdChange,
  showAllAddresses,
  onShowAllAddressesChange,
  clientType = 'individual',
  isMobile: propIsMobile,
}) => {
  const { t } = useTranslation();
  const { isMobile: responsiveIsMobile } = useResponsive();
  const isMobile = propIsMobile ?? responsiveIsMobile;

  const visibleAddresses = addresses.slice(0, MAX_VISIBLE_ADDRESSES);

  const handleOpenAddressDialog = () => {
    onEditingAddressIdChange(null);
    onNewAddressChange({
      addressType: clientType === 'business' ? 'establishment' : 'residence',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      info: '',
    });
    onDialogOpenChange(true);
  };

  const handleEditAddress = (address: Address) => {
    onEditingAddressIdChange(address.id);
    onNewAddressChange({
      addressType: address.addressType,
      street: address.street,
      number: address.number,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      info: address.info,
    });
    onDialogOpenChange(true);
  };

  const handleSaveAddress = () => {
    if (editingAddressId) {
      const fields: (keyof NewAddressFields)[] = [
        'addressType',
        'street',
        'number',
        'neighborhood',
        'city',
        'state',
        'info',
      ];
      fields.forEach((field) => {
        updateAddress(editingAddressId, field, newAddress[field]);
      });
    } else {
      addAddress(newAddress);
    }
    onDialogOpenChange(false);
  };

  const handleCloseAddressPanel = () => {
    onShowAllAddressesChange(false);
  };

  const addressListItems = (
    <div className="space-y-2">
      {addresses.map((address) => (
        <Card
          key={address.id}
          padding="sm"
          className={`relative group min-h-[60px] cursor-pointer transition-colors ${
            isMobile ? '' : 'hover:bg-accent'
          }`}
          onClick={() => handleEditAddress(address)}
        >
          <div className="flex items-start gap-2 pr-8">
            <AddressTypeIcon
              addressType={address.addressType}
              className="size-4 shrink-0 mt-0.5 text-muted-foreground"
            />
            <div className="space-y-0.5 min-w-0">
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
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`absolute top-1 right-1 size-6 transition-opacity ${
              isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              removeAddress(address.id);
            }}
            aria-label={t('client.address.remove')}
          >
            <Trash2 className="size-3 text-muted-foreground" />
          </Button>
        </Card>
      ))}
    </div>
  );

  return (
    <>
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
          <Text variant="bodySmall" color="muted" className="text-center py-4">
            {t('client.address.empty')}
          </Text>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {visibleAddresses.map((address) => (
              <Card
                key={address.id}
                padding="sm"
                className="relative group min-h-[80px] cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleEditAddress(address)}
              >
                <div className="flex items-start gap-2 pr-6">
                  <AddressTypeIcon
                    addressType={address.addressType}
                    className="size-4 shrink-0 mt-0.5 text-muted-foreground"
                  />
                  <div className="space-y-0.5 min-w-0">
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
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAddress(address.id);
                  }}
                  aria-label={t('client.address.remove')}
                >
                  <Trash2 className="size-3 text-muted-foreground" />
                </Button>
              </Card>
            ))}
            {addresses.length >= MAX_VISIBLE_ADDRESSES + 1 && (
              <Card
                padding="sm"
                className="flex items-center justify-center min-h-[80px]"
              >
                <Button
                  type="button"
                  variant="link"
                  onClick={() => onShowAllAddressesChange(true)}
                >
                  {t('client.address.viewMore', {
                    count: addresses.length - MAX_VISIBLE_ADDRESSES,
                  })}
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Address panel: drawer (desktop) or bottom sheet (mobile) */}
      {isMobile ? (
        <BottomSheet
          open={showAllAddresses}
          onClose={handleCloseAddressPanel}
          title={t('client.address.allTitle')}
        >
          {addressListItems}
        </BottomSheet>
      ) : (
        <Drawer
          open={showAllAddresses}
          onClose={handleCloseAddressPanel}
          title={t('client.address.allTitle')}
        >
          {addressListItems}
        </Drawer>
      )}

      {/* Address creation dialog */}
      <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddressId
                ? t('client.address.dialog.editTitle')
                : t('client.address.dialog.title')}
            </DialogTitle>
            <DialogDescription>{t('client.address.add')}</DialogDescription>
          </DialogHeader>
          <div
            className="space-y-4"
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                newAddress.street.trim()
              ) {
                e.preventDefault();
                handleSaveAddress();
              }
            }}
          >
            <Tabs
              value={newAddress.addressType}
              onValueChange={(val: string) =>
                onNewAddressChange({
                  ...newAddress,
                  addressType: val as AddressType,
                })
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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <Input
                  id="new-address-street"
                  label={t('client.address.street')}
                  placeholder={t('client.address.street.placeholder')}
                  value={newAddress.street}
                  onChange={(e) =>
                    onNewAddressChange({
                      ...newAddress,
                      street: e.target.value,
                    })
                  }
                />
              </div>
              <Input
                id="new-address-number"
                label={t('client.address.number')}
                placeholder={t('client.address.number.placeholder')}
                value={newAddress.number}
                onChange={(e) =>
                  onNewAddressChange({
                    ...newAddress,
                    number: e.target.value,
                  })
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
                  onNewAddressChange({
                    ...newAddress,
                    neighborhood: e.target.value,
                  })
                }
              />
              <Input
                id="new-address-city"
                label={t('client.address.city')}
                placeholder={t('client.address.city.placeholder')}
                value={newAddress.city}
                onChange={(e) =>
                  onNewAddressChange({
                    ...newAddress,
                    city: e.target.value,
                  })
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
                    onNewAddressChange({
                      ...newAddress,
                      state: val,
                    })
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
                  onNewAddressChange({
                    ...newAddress,
                    info: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onDialogOpenChange(false)}
              shortcut="Esc"
            >
              {t('app.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSaveAddress}
              disabled={!newAddress.street.trim()}
              shortcut="Enter"
            >
              {t('client.address.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

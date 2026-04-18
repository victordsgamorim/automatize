import React, { useState } from 'react';
import { House, Building2, Trash2, Plus } from 'lucide-react';
import {
  Button,
  SecondaryButton,
  Text,
  Card,
  Drawer,
  BottomSheet,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { useResponsive } from '@automatize/ui/responsive';
import type { Address, AddressType } from '../../ClientFormScreen.types';
import { AddressDialog } from '../../../components/AddressDialog/AddressDialog.web';
import { useAddressDialog } from '../../../components/AddressDialog/useAddressDialog';

const MAX_VISIBLE_ADDRESSES = 5;

export type NewAddressFields = Omit<Address, 'id'>;

const EMPTY_ADDRESS: NewAddressFields = {
  addressType: 'residence',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  info: '',
};

export interface AddressSectionProps {
  addresses: Address[];
  addAddress: (data: NewAddressFields) => void;
  removeAddress: (id: string) => void;
  updateAddress: (
    id: string,
    field: keyof NewAddressFields,
    value: string
  ) => void;
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
  clientType = 'individual',
  isMobile: propIsMobile,
}) => {
  const { t } = useTranslation();
  const { isMobile: responsiveIsMobile } = useResponsive();
  const isMobile = propIsMobile ?? responsiveIsMobile;

  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const addressDialog = useAddressDialog<NewAddressFields>(EMPTY_ADDRESS);

  const visibleAddresses = addresses.slice(0, MAX_VISIBLE_ADDRESSES);

  const handleOpenNew = () => {
    addressDialog.openNew({
      addressType: clientType === 'business' ? 'establishment' : 'residence',
    });
  };

  const handleEdit = (address: Address) => {
    addressDialog.openEdit(address);
  };

  const handleSave = () => {
    const editingId = addressDialog.editingId;
    if (editingId) {
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
        updateAddress(editingId, field, addressDialog.data[field]);
      });
    } else {
      addAddress(addressDialog.data);
    }
    addressDialog.close();
  };

  const handleClosePanel = () => {
    setShowAllAddresses(false);
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
          onClick={() => handleEdit(address)}
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
          <SecondaryButton
            type="button"
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
          </SecondaryButton>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Text variant="h3">{t('client.addresses')}</Text>
          <SecondaryButton
            type="button"
            size="icon"
            onClick={handleOpenNew}
            aria-label={t('client.address.add')}
          >
            <Plus className="size-4" />
          </SecondaryButton>
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
                onClick={() => handleEdit(address)}
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
                <SecondaryButton
                  type="button"
                  size="icon"
                  className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAddress(address.id);
                  }}
                  aria-label={t('client.address.remove')}
                >
                  <Trash2 className="size-3 text-muted-foreground" />
                </SecondaryButton>
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
                  onClick={() => setShowAllAddresses(true)}
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

      {isMobile ? (
        <BottomSheet
          open={showAllAddresses}
          onClose={handleClosePanel}
          title={t('client.address.allTitle')}
        >
          {addressListItems}
        </BottomSheet>
      ) : (
        <Drawer
          open={showAllAddresses}
          onClose={handleClosePanel}
          title={t('client.address.allTitle')}
        >
          {addressListItems}
        </Drawer>
      )}

      <AddressDialog
        open={addressDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) addressDialog.close();
        }}
        data={addressDialog.data}
        onChange={addressDialog.setData}
        onSave={handleSave}
        editingId={addressDialog.editingId}
        variant="tabs"
        title={
          addressDialog.editingId
            ? t('client.address.dialog.editTitle')
            : t('client.address.dialog.title')
        }
        description={t('client.address.add')}
        saveLabel={t('client.address.save')}
      />
    </>
  );
};

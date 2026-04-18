import React, { useState } from 'react';
import { Smartphone, Phone as PhoneIcon, Trash2, Plus } from 'lucide-react';
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
import type { Phone, PhoneType } from '../../ClientFormScreen.types';
import { PhoneDialog } from '../../../components/PhoneDialog/PhoneDialog.web';
import { usePhoneDialog } from '../../../components/PhoneDialog/usePhoneDialog';

const MAX_VISIBLE_PHONES = 5;

export type NewPhoneFields = Omit<Phone, 'id'>;

const EMPTY_PHONE: NewPhoneFields = {
  phoneType: 'mobile',
  number: '',
};

export interface PhoneSectionProps {
  phones: Phone[];
  addPhone: (data: NewPhoneFields) => void;
  removePhone: (id: string) => void;
  updatePhone: (id: string, field: keyof NewPhoneFields, value: string) => void;
  clientType?: 'individual' | 'business';
  isMobile?: boolean;
}

function PhoneTypeIcon({
  phoneType,
  className = 'size-4 shrink-0 text-muted-foreground',
}: {
  phoneType: PhoneType;
  className?: string;
}): React.ReactElement {
  return phoneType === 'mobile' ? (
    <Smartphone className={className} />
  ) : (
    <PhoneIcon className={className} />
  );
}

export const PhoneSection: React.FC<PhoneSectionProps> = ({
  phones,
  addPhone,
  removePhone,
  updatePhone,
  clientType = 'individual',
  isMobile: propIsMobile,
}) => {
  const { t } = useTranslation();
  const { isMobile: responsiveIsMobile } = useResponsive();
  const isMobile = propIsMobile ?? responsiveIsMobile;

  const [showAllPhones, setShowAllPhones] = useState(false);
  const phoneDialog = usePhoneDialog<NewPhoneFields>(EMPTY_PHONE);

  const visiblePhones = phones.slice(0, MAX_VISIBLE_PHONES);

  const handleOpenNew = () => {
    phoneDialog.openNew({
      phoneType: clientType === 'business' ? 'telephone' : 'mobile',
    });
  };

  const handleEdit = (phone: Phone) => {
    phoneDialog.openEdit(phone);
  };

  const handleSave = () => {
    const editingId = phoneDialog.editingId;
    if (editingId) {
      const fields: (keyof NewPhoneFields)[] = ['phoneType', 'number'];
      fields.forEach((field) => {
        updatePhone(editingId, field, phoneDialog.data[field]);
      });
    } else {
      addPhone(phoneDialog.data);
    }
    phoneDialog.close();
  };

  const handleClosePanel = () => {
    setShowAllPhones(false);
  };

  const phoneListItems = (
    <div className="space-y-2">
      {phones.map((phone) => (
        <Card
          key={phone.id}
          padding="sm"
          className={`relative group min-h-[60px] cursor-pointer transition-colors ${
            isMobile ? '' : 'hover:bg-accent'
          }`}
          onClick={() => handleEdit(phone)}
        >
          <div className="flex items-start gap-2 pr-8">
            <PhoneTypeIcon
              phoneType={phone.phoneType}
              className="size-4 shrink-0 mt-0.5 text-muted-foreground"
            />
            <div className="space-y-0.5 min-w-0">
              {phone.number ? (
                <Text
                  variant="bodySmall"
                  color="primary"
                  className="line-clamp-1"
                >
                  {phone.number}
                </Text>
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
              removePhone(phone.id);
            }}
            aria-label={t('client.phone.remove')}
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
          <Text variant="h3">{t('client.phones')}</Text>
          <SecondaryButton
            type="button"
            size="icon"
            onClick={handleOpenNew}
            aria-label={t('client.phone.add')}
          >
            <Plus className="size-4" />
          </SecondaryButton>
        </div>

        {visiblePhones.length === 0 ? (
          <Text variant="bodySmall" color="muted" className="text-center py-4">
            {t('client.phone.empty')}
          </Text>
        ) : (
          <div className="flex flex-wrap gap-3">
            {visiblePhones.map((phone) => (
              <Card
                key={phone.id}
                padding="sm"
                className="relative group w-fit cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleEdit(phone)}
              >
                <div className="flex items-start gap-2 pr-6">
                  <PhoneTypeIcon
                    phoneType={phone.phoneType}
                    className="size-4 shrink-0 mt-0.5 text-muted-foreground"
                  />
                  <div className="space-y-0.5 min-w-0">
                    {phone.number ? (
                      <Text
                        variant="bodySmall"
                        color="primary"
                        className="line-clamp-1"
                      >
                        {phone.number}
                      </Text>
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
                    removePhone(phone.id);
                  }}
                  aria-label={t('client.phone.remove')}
                >
                  <Trash2 className="size-3 text-muted-foreground" />
                </SecondaryButton>
              </Card>
            ))}
            {phones.length >= MAX_VISIBLE_PHONES + 1 && (
              <Card
                padding="sm"
                className="flex items-center justify-center min-h-[80px]"
              >
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowAllPhones(true)}
                >
                  {t('client.phone.viewMore', {
                    count: phones.length - MAX_VISIBLE_PHONES,
                  })}
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>

      {isMobile ? (
        <BottomSheet
          open={showAllPhones}
          onClose={handleClosePanel}
          title={t('client.phone.allTitle')}
        >
          {phoneListItems}
        </BottomSheet>
      ) : (
        <Drawer
          open={showAllPhones}
          onClose={handleClosePanel}
          title={t('client.phone.allTitle')}
        >
          {phoneListItems}
        </Drawer>
      )}

      <PhoneDialog
        open={phoneDialog.isOpen}
        onOpenChange={(v) => {
          if (!v) phoneDialog.close();
        }}
        data={phoneDialog.data}
        onChange={phoneDialog.setData}
        onSave={handleSave}
        editingId={phoneDialog.editingId}
        variant="tabs"
        title={
          phoneDialog.editingId
            ? t('client.phone.dialog.editTitle')
            : t('client.phone.dialog.title')
        }
        description={t('client.phone.add')}
        saveLabel={t('client.phone.save')}
      />
    </>
  );
};

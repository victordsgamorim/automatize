import React from 'react';
import { Smartphone, Phone as PhoneIcon, Trash2, Plus } from 'lucide-react';
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
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { useResponsive } from '@automatize/ui/responsive';
import type { Phone, PhoneType } from '../ClientFormScreen.types';

const MAX_VISIBLE_PHONES = 5;

export type NewPhoneFields = Omit<Phone, 'id'>;

export interface PhoneSectionProps {
  phones: Phone[];
  addPhone: (data: NewPhoneFields) => void;
  removePhone: (id: string) => void;
  updatePhone: (id: string, field: keyof NewPhoneFields, value: string) => void;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  newPhone: NewPhoneFields;
  onNewPhoneChange: (data: NewPhoneFields) => void;
  editingPhoneId: string | null;
  onEditingPhoneIdChange: (id: string | null) => void;
  showAllPhones: boolean;
  onShowAllPhonesChange: (show: boolean) => void;
  isMobile?: boolean;
}

function PhoneTypeIcon({
  phoneType,
  className = 'size-4 shrink-0 text-muted-foreground',
}: {
  phoneType: PhoneType;
  className?: string;
}) {
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
  isDialogOpen,
  onDialogOpenChange,
  newPhone,
  onNewPhoneChange,
  editingPhoneId,
  onEditingPhoneIdChange,
  showAllPhones,
  onShowAllPhonesChange,
  isMobile: propIsMobile,
}) => {
  const { t } = useTranslation();
  const { isMobile: responsiveIsMobile } = useResponsive();
  const isMobile = propIsMobile ?? responsiveIsMobile;

  const visiblePhones = phones.slice(0, MAX_VISIBLE_PHONES);

  const handleOpenPhoneDialog = () => {
    onEditingPhoneIdChange(null);
    onNewPhoneChange({
      phoneType: 'mobile',
      number: '',
    });
    onDialogOpenChange(true);
  };

  const handleEditPhone = (phone: Phone) => {
    onEditingPhoneIdChange(phone.id);
    onNewPhoneChange({
      phoneType: phone.phoneType,
      number: phone.number,
    });
    onDialogOpenChange(true);
  };

  const handleSavePhone = () => {
    if (editingPhoneId) {
      (Object.keys(newPhone) as (keyof NewPhoneFields)[]).forEach((field) => {
        updatePhone(editingPhoneId, field, newPhone[field]);
      });
    } else {
      addPhone(newPhone);
    }
    onDialogOpenChange(false);
  };

  const handleClosePhonePanel = () => {
    onShowAllPhonesChange(false);
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
          onClick={() => handleEditPhone(phone)}
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
          <Button
            type="button"
            variant="ghost"
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
          </Button>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Text variant="h3">{t('client.phones')}</Text>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleOpenPhoneDialog}
            aria-label={t('client.phone.add')}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {visiblePhones.length === 0 ? (
          <Text variant="bodySmall" color="muted" className="text-center py-4">
            {t('client.phone.empty')}
          </Text>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {visiblePhones.map((phone) => (
              <Card
                key={phone.id}
                padding="sm"
                className="relative group min-h-[80px] cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleEditPhone(phone)}
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhone(phone.id);
                  }}
                  aria-label={t('client.phone.remove')}
                >
                  <Trash2 className="size-3 text-muted-foreground" />
                </Button>
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
                  onClick={() => onShowAllPhonesChange(true)}
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

      {/* Phone panel: drawer (desktop) or bottom sheet (mobile) */}
      {isMobile ? (
        <BottomSheet
          open={showAllPhones}
          onClose={handleClosePhonePanel}
          title={t('client.phone.allTitle')}
        >
          {phoneListItems}
        </BottomSheet>
      ) : (
        <Drawer
          open={showAllPhones}
          onClose={handleClosePhonePanel}
          title={t('client.phone.allTitle')}
        >
          {phoneListItems}
        </Drawer>
      )}

      {/* Phone creation/edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPhoneId
                ? t('client.phone.dialog.editTitle')
                : t('client.phone.dialog.title')}
            </DialogTitle>
            <DialogDescription>{t('client.phone.add')}</DialogDescription>
          </DialogHeader>
          <div
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && newPhone.number.trim()) {
                e.preventDefault();
                handleSavePhone();
              }
            }}
          >
            <Tabs
              value={newPhone.phoneType}
              onValueChange={(val: string) =>
                onNewPhoneChange({
                  ...newPhone,
                  phoneType: val as PhoneType,
                })
              }
            >
              <TabsList variant="default" size="sm">
                <TabsTrigger value="mobile">
                  <Smartphone className="size-3.5" />
                  {t('client.phone.type.mobile')}
                </TabsTrigger>
                <TabsTrigger value="telephone">
                  <PhoneIcon className="size-3.5" />
                  {t('client.phone.type.telephone')}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Input
              id="new-phone-number"
              label={t('client.phone.label')}
              placeholder={t('client.phone.placeholder')}
              value={newPhone.number}
              onChange={(e) =>
                onNewPhoneChange({
                  ...newPhone,
                  number: e.target.value,
                })
              }
            />
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
              onClick={handleSavePhone}
              disabled={!newPhone.number.trim()}
              shortcut="Enter"
            >
              {t('client.phone.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

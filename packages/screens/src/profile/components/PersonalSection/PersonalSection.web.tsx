import React from 'react';
import { Input, Text } from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { PhoneSection } from '../../../client-form/components/PhoneSection/PhoneSection.web';
import type { Phone } from '../../ProfileScreen.types';
import type { NewPhoneFields } from '../../../client-form/components/PhoneSection/PhoneSection.web';

export interface PersonalSectionProps {
  name: string;
  onNameChange: (name: string) => void;
  phones: Phone[];
  addPhone: (data?: Partial<Omit<Phone, 'id'>>) => void;
  removePhone: (id: string) => void;
  updatePhone: (
    id: string,
    field: keyof Omit<Phone, 'id'>,
    value: string
  ) => void;
  isPhoneDialogOpen: boolean;
  onPhoneDialogOpenChange: (open: boolean) => void;
  newPhone: NewPhoneFields;
  onNewPhoneChange: (
    data: NewPhoneFields | ((prev: NewPhoneFields) => NewPhoneFields)
  ) => void;
  editingPhoneId: string | null;
  onEditingPhoneIdChange: (id: string | null) => void;
  showAllPhones: boolean;
  onShowAllPhonesChange: (show: boolean) => void;
  isMobile?: boolean;
}

export const PersonalSection: React.FC<PersonalSectionProps> = ({
  name,
  onNameChange,
  phones,
  addPhone,
  removePhone,
  updatePhone,
  isPhoneDialogOpen,
  onPhoneDialogOpenChange,
  newPhone,
  onNewPhoneChange,
  editingPhoneId,
  onEditingPhoneIdChange,
  showAllPhones,
  onShowAllPhonesChange,
  isMobile,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Text variant="h3">{t('profile.section.personal')}</Text>
      <Input
        id="profile-name"
        label={t('profile.name')}
        placeholder={t('profile.name.placeholder')}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        required
      />
      <PhoneSection
        phones={phones}
        addPhone={addPhone}
        removePhone={removePhone}
        updatePhone={updatePhone}
        isDialogOpen={isPhoneDialogOpen}
        onDialogOpenChange={onPhoneDialogOpenChange}
        newPhone={newPhone}
        onNewPhoneChange={onNewPhoneChange}
        editingPhoneId={editingPhoneId}
        onEditingPhoneIdChange={onEditingPhoneIdChange}
        showAllPhones={showAllPhones}
        onShowAllPhonesChange={onShowAllPhonesChange}
        isMobile={isMobile}
      />
    </div>
  );
};

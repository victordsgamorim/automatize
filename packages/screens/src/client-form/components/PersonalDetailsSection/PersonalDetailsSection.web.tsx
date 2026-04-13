import React from 'react';
import { Building2, User } from 'lucide-react';
import { Input, Text, Tabs, TabsList, TabsTrigger } from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { formatCpf, formatCnpj } from '@automatize/form-validator';
import type { ClientType } from '../../ClientFormScreen.types';

export interface PersonalDetailsSectionProps {
  clientType: ClientType;
  onClientTypeChange: (type: ClientType) => void;
  name: string;
  onNameChange: (name: string) => void;
  document: string;
  onDocumentChange: (document: string) => void;
}

export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({
  clientType,
  onClientTypeChange,
  name,
  onNameChange,
  document,
  onDocumentChange,
}) => {
  const { t } = useTranslation();

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted =
      clientType === 'individual'
        ? formatCpf(e.target.value)
        : formatCnpj(e.target.value);
    onDocumentChange(formatted);
  };

  const documentMaxLength = clientType === 'individual' ? 14 : 18;
  const documentPlaceholder =
    clientType === 'individual' ? '000.000.000-00' : '00.000.000/0000-00';
  const namePlaceholder =
    clientType === 'individual'
      ? t('client.name.placeholder')
      : t('client.name.placeholder.business');

  return (
    <div className="space-y-6">
      {/* Client Type */}
      <div className="space-y-2">
        <Text variant="bodySmall" color="muted">
          {t('client.type')}
        </Text>
        <Tabs
          value={clientType}
          onValueChange={(val) =>
            onClientTypeChange(val as 'individual' | 'business')
          }
        >
          <TabsList variant="default" size="sm">
            <TabsTrigger value="individual">
              <User className="size-3.5" />
              {t('client.type.individual')}
            </TabsTrigger>
            <TabsTrigger value="business">
              <Building2 className="size-3.5" />
              {t('client.type.business')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Name */}
      <Input
        id="client-name"
        name="name"
        label={t('client.name')}
        placeholder={namePlaceholder}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />

      {/* CPF / CNPJ */}
      <Input
        id="client-document"
        name="document"
        label={clientType === 'individual' ? t('client.cpf') : t('client.cnpj')}
        placeholder={documentPlaceholder}
        value={document}
        onChange={handleDocumentChange}
        maxLength={documentMaxLength}
      />
    </div>
  );
};

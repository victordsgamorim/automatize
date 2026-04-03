import React from 'react';
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
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import type { ClientScreenProps } from './ClientScreen.types';
import { useClient } from './useClient';

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

/** Formats a raw digit string as CPF: 000.000.000-00 */
function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/** Formats a raw digit string as CNPJ: 00.000.000/0000-00 */
function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export const ClientScreen: React.FC<ClientScreenProps> = ({ onSubmit }) => {
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
    updateAddress,
    phones,
    addPhone,
    removePhone,
    updatePhone,
    getFormData,
  } = useClient();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(getFormData());
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Card padding="lg">
        <div className="space-y-6">
          <Text variant="h2">{t('client.title')}</Text>

          <Separator />

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
                  onClick={addAddress}
                  aria-label={t('client.address.add')}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              {addresses.map((address, index) => (
                <Card key={address.id} padding="md" className="relative">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Text variant="bodySmall" color="muted">
                        #{index + 1}
                      </Text>
                      {addresses.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAddress(address.id)}
                          aria-label={t('client.address.remove')}
                        >
                          <Trash2 className="size-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        <Input
                          id={`address-street-${address.id}`}
                          label={t('client.address.street')}
                          placeholder={t('client.address.street.placeholder')}
                          value={address.street}
                          onChange={(e) =>
                            updateAddress(address.id, 'street', e.target.value)
                          }
                        />
                      </div>
                      <Input
                        id={`address-number-${address.id}`}
                        label={t('client.address.number')}
                        placeholder={t('client.address.number.placeholder')}
                        value={address.number}
                        onChange={(e) =>
                          updateAddress(address.id, 'number', e.target.value)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        id={`address-neighborhood-${address.id}`}
                        label={t('client.address.neighborhood')}
                        placeholder={t(
                          'client.address.neighborhood.placeholder'
                        )}
                        value={address.neighborhood}
                        onChange={(e) =>
                          updateAddress(
                            address.id,
                            'neighborhood',
                            e.target.value
                          )
                        }
                      />
                      <Input
                        id={`address-city-${address.id}`}
                        label={t('client.address.city')}
                        placeholder={t('client.address.city.placeholder')}
                        value={address.city}
                        onChange={(e) =>
                          updateAddress(address.id, 'city', e.target.value)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Text
                          htmlFor={`address-state-${address.id}`}
                          color="muted"
                          className="pl-3"
                        >
                          {t('client.address.state')}
                        </Text>
                        <Select
                          value={address.state}
                          onValueChange={(val) =>
                            updateAddress(address.id, 'state', val)
                          }
                        >
                          <SelectTrigger
                            id={`address-state-${address.id}`}
                            className="border-border bg-foreground/5 backdrop-blur-sm"
                          >
                            <SelectValue
                              placeholder={t(
                                'client.address.state.placeholder'
                              )}
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
                        id={`address-info-${address.id}`}
                        label={t('client.address.info')}
                        placeholder={t('client.address.info.placeholder')}
                        value={address.info}
                        onChange={(e) =>
                          updateAddress(address.id, 'info', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}
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
            <div className="flex justify-end">
              <Button type="submit">{t('client.submit')}</Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

import type { LocaleData } from '@automatize/core-localization';
import type { ThemeData } from '@automatize/core-theme';

export type { LanguageOption, LocaleData } from '@automatize/core-localization';
export type { ThemeData, ThemeOption } from '@automatize/core-theme';

export type ClientType = 'individual' | 'business';

export interface Address {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  info: string;
}

export interface Phone {
  id: string;
  number: string;
}

export interface ClientFormData {
  clientType: ClientType;
  name: string;
  document: string;
  addresses: Address[];
  phones: Phone[];
}

export interface ClientFormScreenProps {
  /** Called when the form is submitted with valid data */
  onSubmit: (data: ClientFormData) => void;
  /** Language switcher data */
  locale: LocaleData;
  /** Theme switcher data (web only — ignored on native) */
  theme?: ThemeData;
  /** Initial data to populate the form (e.g. restored from storage) */
  initialData?: ClientFormData;
  /** Called whenever form data changes — use for persistence */
  onDataChange?: (data: ClientFormData) => void;
}

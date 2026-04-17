import type { LocaleData } from '@automatize/core-localization';
import type { ThemeData } from '@automatize/core-theme';

export type { LanguageOption, LocaleData } from '@automatize/core-localization';
export type { ThemeData, ThemeOption } from '@automatize/core-theme';

export type ClientType = 'individual' | 'business';

export type AddressType = 'residence' | 'establishment';

export interface Address {
  id: string;
  addressType: AddressType;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  info: string;
}

export type PhoneType = 'mobile' | 'telephone';

export interface Phone {
  id: string;
  phoneType: PhoneType;
  number: string;
}

export interface ClientFormData {
  clientType: ClientType;
  name: string;
  document: string;
  addresses: Address[];
  phones: Phone[];
}

export type ClientFormMode = 'create' | 'edit';

export interface ClientFormScreenProps {
  /** Form mode — controls title, description, and submit labels. Default: 'create' */
  mode?: ClientFormMode;
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
  /** Called when the user confirms leaving the form (back navigation) */
  onBack?: () => void;
  /** When true, shows the discard confirmation dialog */
  showDiscardDialog?: boolean;
  /** Called when the user cancels the discard dialog */
  onDiscardCancel?: () => void;
}

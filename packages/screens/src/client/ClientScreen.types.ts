import type { LocaleData } from '@automatize/core-localization';
import type { ThemeData } from '@automatize/core-theme';

export type { LanguageOption, LocaleData } from '@automatize/core-localization';
export type { ThemeData, ThemeOption } from '@automatize/core-theme';

export type ClientAddressType = 'residence' | 'establishment';
export type ClientPhoneType = 'mobile' | 'telephone';

export interface ClientAddress {
  id: string;
  /** Residence or establishment — optional for backward compat */
  addressType?: ClientAddressType;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  /** Additional info (apt number, block, etc.) — optional */
  info?: string;
}

export interface ClientPhone {
  id: string;
  /** Mobile or telephone — optional for backward compat */
  phoneType?: ClientPhoneType;
  number: string;
}

export type ClientTypeRow = 'individual' | 'business';

export interface ClientRow {
  id: string;
  name: string;
  /** Individual or business — optional for backward compat */
  clientType?: ClientTypeRow;
  /** CPF (individual) or CNPJ (business) — optional for backward compat */
  document?: string;
  addresses: ClientAddress[];
  phones: ClientPhone[];
}

export interface ClientScreenProps {
  /** List of clients to display in the table */
  clients: ClientRow[];
  /** Called when the "Add new client" button is pressed */
  onAddClient: () => void;
  /** Called when a client row is clicked (opens detail drawer internally) */
  onClientClick?: (client: ClientRow) => void;
  /** Called when a client row checkbox is toggled */
  onClientSelect?: (clientId: string) => void;
  /** Called when the "Edit" button inside the detail drawer is pressed */
  onEditClient?: (client: ClientRow) => void;
  /** Language switcher data */
  locale: LocaleData;
  /** Theme switcher data (web only — ignored on native) */
  theme?: ThemeData;
}

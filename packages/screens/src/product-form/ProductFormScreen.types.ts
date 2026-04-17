import type { LocaleData } from '@automatize/core-localization';
import type { ThemeData } from '@automatize/core-theme';

export type { LanguageOption, LocaleData } from '@automatize/core-localization';
export type { ThemeData, ThemeOption } from '@automatize/core-theme';

export type ProductFormMode = 'create' | 'edit';

export interface Company {
  id: string;
  name: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  quantity: number;
  info: string;
  /** URL of the existing photo (set when editing) */
  photoUrl?: string;
  /** File selected by the user — parent is responsible for uploading */
  photoFile?: File;
  companyId?: string;
}

export interface ProductFormScreenProps {
  /** Form mode — controls title, description, and submit labels. Default: 'create' */
  mode?: ProductFormMode;
  /** Called when the form is submitted */
  onSubmit: (data: ProductFormData) => void;
  /** Language switcher data */
  locale: LocaleData;
  /** Theme switcher data (web only — ignored on native) */
  theme?: ThemeData;
  /** Initial data to populate the form (e.g. when editing) */
  initialData?: Partial<ProductFormData>;
  /** List of companies for the company selector */
  companies?: Company[];
  /** Called when the user adds a new company via the inline form */
  onAddCompany?: (name: string) => void;
  /** Called whenever form data changes — use for persistence */
  onDataChange?: (data: Partial<ProductFormData>) => void;
  /** Called when the user confirms leaving the form (back navigation) */
  onBack?: () => void;
  /** When true, shows the discard confirmation dialog */
  showDiscardDialog?: boolean;
  /** Called when the user cancels the discard dialog */
  onDiscardCancel?: () => void;
}

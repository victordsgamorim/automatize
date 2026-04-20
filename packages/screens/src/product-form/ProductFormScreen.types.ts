import type { LocaleData } from '@automatize/core-localization';
import type { ThemeData } from '@automatize/core-theme';

export type { LanguageOption, LocaleData } from '@automatize/core-localization';
export type { ThemeData, ThemeOption } from '@automatize/core-theme';

export type ProductFormMode = 'create' | 'edit';

export interface Supplier {
  id: string;
  name: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  quantity: number;
  info: string;
  photoUrl?: string;
  photoFile?: File;
  companyId?: string;
}

export interface ProductFormScreenProps {
  mode?: ProductFormMode;
  onSubmit: (data: ProductFormData) => void;
  locale: LocaleData;
  theme?: ThemeData;
  initialData?: Partial<ProductFormData>;
  suppliers?: Supplier[];
  onAddSupplier?: (name: string) => void;
  onDataChange?: (data: Partial<ProductFormData>) => void;
  onBack?: () => void;
  showDiscardDialog?: boolean;
  onDiscardCancel?: () => void;
}

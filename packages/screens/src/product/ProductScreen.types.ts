import type { LocaleData } from '@automatize/core-localization';
import type { ThemeData } from '@automatize/core-theme';

export type { LanguageOption, LocaleData } from '@automatize/core-localization';
export type { ThemeData, ThemeOption } from '@automatize/core-theme';

export interface ProductRow {
  id: string;
  name: string;
  quantity: number;
  price: number;
  /** URL of the product photo — optional */
  photo?: string;
  companyId?: string;
  companyName?: string;
  /** Additional info — optional */
  info?: string;
}

export interface ProductScreenProps {
  /** List of products to display in the table */
  products: ProductRow[];
  /** Called when the "Add new product" button is pressed */
  onAddProduct: () => void;
  /** Called when the "Edit" button inside the detail drawer is pressed */
  onEditProduct?: (product: ProductRow) => void;
  /** Language switcher data */
  locale: LocaleData;
  /** Theme switcher data (web only — ignored on native) */
  theme?: ThemeData;
}

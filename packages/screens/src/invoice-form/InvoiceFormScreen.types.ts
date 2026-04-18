import type {
  ClientRow,
  ClientAddress,
  ClientPhone,
} from '../client/ClientScreen.types';
import type { ProductRow } from '../product/ProductScreen.types';
import type { TechnicianRow } from '../technician/TechnicianScreen.types';

export type {
  ClientRow,
  ClientAddress,
  ClientPhone,
  ProductRow,
  TechnicianRow,
};

export interface InvoiceProductItem {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
  totalPrice: number;
}

export interface InvoiceTechnician {
  id: string;
  name: string;
  active: boolean;
}

export interface WarrantyOption {
  id: string;
  label: string;
  months: number;
}

export interface InvoiceFormData {
  clientId?: string;
  clientName?: string;
  clientAddresses: ClientAddress[];
  clientPhones: ClientPhone[];
  products: InvoiceProductItem[];
  technicians: InvoiceTechnician[];
  warrantyMonths: number;
  additionalInfo: string;
  total: number;
}

export type InvoiceFormMode = 'create' | 'edit';

export interface InvoiceFormScreenProps {
  mode?: InvoiceFormMode;
  onSubmit: (data: InvoiceFormData) => void;
  initialData?: Partial<InvoiceFormData>;
  onDataChange?: (data: Partial<InvoiceFormData>) => void;
  onBack?: () => void;
  showDiscardDialog?: boolean;
  onDiscardCancel?: () => void;

  availableClients: ClientRow[];
  availableProducts: ProductRow[];
  availableTechnicians: TechnicianRow[];
  defaultWarrantyOptions?: WarrantyOption[];

  onSaveAddressToClient?: (clientId: string, address: ClientAddress) => void;
  onSavePhoneToClient?: (clientId: string, phone: ClientPhone) => void;
  onAddTechnician?: (name: string) => void;
  onAddWarrantyOption?: (label: string, months: number) => void;
}

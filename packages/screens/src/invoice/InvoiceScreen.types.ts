export interface InvoiceAddressItem {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  addressType?: 'residence' | 'establishment';
  info?: string;
}

export interface InvoicePhoneItem {
  id: string;
  number: string;
  phoneType?: 'mobile' | 'telephone';
}

export interface InvoiceProductItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceTechnicianItem {
  id: string;
  name: string;
}

export interface InvoiceRow {
  id: string;
  clientName: string;
  date: string; // ISO "YYYY-MM-DD"
  warrantyMonths: number;
  total: number;
  /** Client phone numbers linked to this invoice */
  clientPhones?: InvoicePhoneItem[];
  /** Client addresses linked to this invoice */
  clientAddresses?: InvoiceAddressItem[];
  /** Products and quantities included in this invoice */
  products?: InvoiceProductItem[];
  /** Technicians assigned to this invoice */
  technicians?: InvoiceTechnicianItem[];
  /** Free-text additional notes */
  additionalInfo?: string;
}

export interface InvoiceScreenProps {
  invoices: InvoiceRow[];
  onAddInvoice: () => void;
  onEditInvoice?: (invoice: InvoiceRow) => void;
}

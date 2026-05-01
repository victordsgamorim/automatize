export interface InvoiceAddress {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  addressType?: 'residence' | 'establishment';
  info?: string;
}

export interface InvoicePhone {
  id: string;
  number: string;
  phoneType?: 'mobile' | 'telephone';
}

export interface InvoiceProduct {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceTechnicianItem {
  id: string;
  name: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  clientId?: string;
  clientName: string;
  /** ISO date string — "YYYY-MM-DD" */
  date: string;
  warrantyMonths: number;
  total: number;
  additionalInfo: string;
  clientAddresses: InvoiceAddress[];
  clientPhones: InvoicePhone[];
  products: InvoiceProduct[];
  technicians: InvoiceTechnicianItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateInvoiceInput {
  clientId?: string;
  clientName: string;
  date: string;
  warrantyMonths: number;
  total: number;
  additionalInfo: string;
  clientAddresses: Omit<InvoiceAddress, 'id'>[];
  clientPhones: Omit<InvoicePhone, 'id'>[];
  products: InvoiceProduct[];
  technicians: InvoiceTechnicianItem[];
}

export interface UpdateInvoiceInput {
  clientId?: string;
  clientName?: string;
  date?: string;
  warrantyMonths?: number;
  total?: number;
  additionalInfo?: string;
  clientAddresses?: Omit<InvoiceAddress, 'id'>[];
  clientPhones?: Omit<InvoicePhone, 'id'>[];
  products?: InvoiceProduct[];
  technicians?: InvoiceTechnicianItem[];
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

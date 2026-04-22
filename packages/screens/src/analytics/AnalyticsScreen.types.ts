import type { ClientRow } from '../client/ClientScreen.types';
import type { ProductRow } from '../product/ProductScreen.types';
import type { TechnicianRow } from '../technician/TechnicianScreen.types';
import type { InvoiceRow } from '../invoice/InvoiceScreen.types';
import type { InvoiceFormData } from '../invoice-form/InvoiceFormScreen.types';

export type {
  ClientRow,
  ProductRow,
  TechnicianRow,
  InvoiceRow,
  InvoiceFormData,
};

export interface AnalyticsScreenProps {
  invoices: InvoiceRow[];
  /** Detailed invoice data keyed by invoice id — for product/technician breakdown */
  invoiceDetails: Map<string, InvoiceFormData>;
  clients: ClientRow[];
  products: ProductRow[];
  technicians: TechnicianRow[];
}

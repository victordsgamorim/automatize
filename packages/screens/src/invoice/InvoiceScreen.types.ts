export interface InvoiceRow {
  id: string;
  clientName: string;
  date: string; // ISO "YYYY-MM-DD"
  warrantyMonths: number;
  total: number;
}

export interface InvoiceScreenProps {
  invoices: InvoiceRow[];
  onAddInvoice: () => void;
  onEditInvoice?: (invoice: InvoiceRow) => void;
}

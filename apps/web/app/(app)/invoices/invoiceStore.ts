import type { InvoiceRow } from '@automatize/screens/invoice/web';
import type {
  InvoiceFormData,
  WarrantyOption,
} from '@automatize/screens/invoice-form/web';
import type { TechnicianRow } from '@automatize/screens/technician/web';

/**
 * Module-level in-memory store.
 * Survives SPA navigations; cleared on page refresh (JS runtime restart).
 */
let savedInvoices: InvoiceRow[] = [];
const invoiceFormDataMap = new Map<string, InvoiceFormData>();
/** Preserves the original creation date for edit mode. */
const invoiceDateMap = new Map<string, string>();
let invoiceIdToEdit: string | undefined;

/** Technicians visible in the invoice form (shared across create/edit). */
let savedTechnicians: TechnicianRow[] = [];

/** Warranty options added at runtime via the extensible dropdown. */
let savedWarrantyOptions: WarrantyOption[] = [];

// ── Invoices ──────────────────────────────────────────────────────────────────

export function getSavedInvoices(): InvoiceRow[] {
  return savedInvoices;
}

export function addSavedInvoice(
  row: InvoiceRow,
  formData: InvoiceFormData
): void {
  savedInvoices = [row, ...savedInvoices];
  invoiceFormDataMap.set(row.id, formData);
  invoiceDateMap.set(row.id, row.date);
}

export function getInvoiceFormData(id: string): InvoiceFormData | undefined {
  return invoiceFormDataMap.get(id);
}

export function getInvoiceDate(id: string): string | undefined {
  return invoiceDateMap.get(id);
}

export function updateSavedInvoice(
  id: string,
  row: InvoiceRow,
  formData: InvoiceFormData
): void {
  savedInvoices = savedInvoices.map((inv) => (inv.id === id ? row : inv));
  invoiceFormDataMap.set(id, formData);
}

export function setInvoiceToEdit(id: string): void {
  invoiceIdToEdit = id;
}

export function getInvoiceIdToEdit(): string | undefined {
  return invoiceIdToEdit;
}

export function clearInvoiceToEdit(): void {
  invoiceIdToEdit = undefined;
}

// ── Technicians ───────────────────────────────────────────────────────────────

export function getSavedTechnicians(): TechnicianRow[] {
  return savedTechnicians;
}

export function addSavedTechnician(name: string): TechnicianRow {
  const today = new Date().toISOString().split('T')[0] ?? '';
  // Avoid duplicates by name (case-insensitive)
  const existing = savedTechnicians.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) return existing;
  const tech: TechnicianRow = {
    id: `tech-${Date.now()}`,
    name,
    entryDate: today,
  };
  savedTechnicians = [...savedTechnicians, tech];
  return tech;
}

// ── Warranty options ──────────────────────────────────────────────────────────

export function getSavedWarrantyOptions(): WarrantyOption[] {
  return savedWarrantyOptions;
}

export function addSavedWarrantyOption(
  label: string,
  months: number
): WarrantyOption {
  const option: WarrantyOption = {
    id: `warranty-${Date.now()}`,
    label,
    months,
  };
  savedWarrantyOptions = [...savedWarrantyOptions, option];
  return option;
}

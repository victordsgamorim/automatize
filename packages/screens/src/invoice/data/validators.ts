import { z } from 'zod';

const invoiceAddressSchema = z.object({
  id: z.string().min(1),
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  addressType: z.enum(['residence', 'establishment']).optional(),
  info: z.string().optional(),
});

const invoicePhoneSchema = z.object({
  id: z.string().min(1),
  number: z.string(),
  phoneType: z.enum(['mobile', 'telephone']).optional(),
});

const invoiceProductSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
});

const invoiceTechnicianSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const invoiceSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  clientId: z.string().optional(),
  clientName: z.string().min(1),
  date: z.string().min(1),
  warrantyMonths: z.number().int().min(0),
  total: z.number().min(0),
  additionalInfo: z.string(),
  clientAddresses: z.array(invoiceAddressSchema),
  clientPhones: z.array(invoicePhoneSchema),
  products: z.array(invoiceProductSchema),
  technicians: z.array(invoiceTechnicianSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().optional(),
  clientName: z.string().min(1),
  date: z.string().min(1),
  warrantyMonths: z.number().int().min(0),
  total: z.number().min(0),
  additionalInfo: z.string(),
  clientAddresses: z.array(invoiceAddressSchema.omit({ id: true })),
  clientPhones: z.array(invoicePhoneSchema.omit({ id: true })),
  products: z.array(invoiceProductSchema),
  technicians: z.array(invoiceTechnicianSchema),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

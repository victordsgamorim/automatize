import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1).max(200),
});

export const updateSupplierSchema = z.object({
  name: z.string().min(1).max(200).optional(),
});

export const supplierSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

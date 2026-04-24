import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().min(0),
  quantity: z.number().int().min(0),
  info: z.string(),
  photoUrl: z.string().optional(),
  companyId: z.string().min(1).optional(),
  companyName: z.string().min(1).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  price: z.number().min(0).optional(),
  quantity: z.number().int().min(0).optional(),
  info: z.string().optional(),
  photoUrl: z.string().optional(),
  companyId: z.string().min(1).optional(),
  companyName: z.string().min(1).optional(),
});

export const productSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().int().min(0),
  info: z.string(),
  photoUrl: z.string().optional(),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

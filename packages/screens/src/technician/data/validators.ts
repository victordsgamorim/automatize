import { z } from 'zod';

export const createTechnicianSchema = z.object({
  name: z.string().min(1).max(200),
  entryDate: z.string().min(1),
});

export const updateTechnicianSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  entryDate: z.string().min(1).optional(),
});

export const technicianSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  entryDate: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

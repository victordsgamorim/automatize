import { z } from 'zod';
import { nameSchema } from '@automatize/form-validator';

export const productFormSchema = z.object({
  name: nameSchema,
  price: z.number().min(0, 'Price must be non-negative'),
  quantity: z.number().int().min(0, 'Quantity must be a non-negative integer'),
  info: z.string().default(''),
  photoUrl: z.string().optional(),
  companyId: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

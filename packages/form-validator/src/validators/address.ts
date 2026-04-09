import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().trim().min(1, 'Street is required'),
  number: z.string().trim().min(1, 'Number is required'),
  neighborhood: z.string().trim().min(1, 'Neighborhood is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  info: z.string().trim().optional().default(''),
});

import { z } from 'zod';
import {
  nameSchema,
  cpfSchema,
  cnpjSchema,
  phoneSchema,
  addressSchema,
} from '@automatize/form-validator';

export const clientFormSchema = z.object({
  clientType: z.enum(['individual', 'business']),
  name: nameSchema,
  document: z.union([cpfSchema, cnpjSchema]),
  addresses: z.array(addressSchema).min(1, 'At least one address is required'),
  phones: z
    .array(z.object({ number: phoneSchema }))
    .min(1, 'At least one phone is required'),
});

export type ClientFormInput = z.infer<typeof clientFormSchema>;

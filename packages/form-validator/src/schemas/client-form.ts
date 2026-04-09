import { z } from 'zod';
import { nameSchema } from '../validators/name';
import { cpfSchema } from '../validators/cpf';
import { cnpjSchema } from '../validators/cnpj';
import { phoneSchema } from '../validators/phone';
import { addressSchema } from '../validators/address';

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

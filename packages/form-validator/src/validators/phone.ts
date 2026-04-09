import { z } from 'zod';

export const phoneSchema = z
  .string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((digits) => digits.length === 10 || digits.length === 11, {
    message: 'Invalid phone number',
  });

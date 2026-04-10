import { z } from 'zod';
import { emailSchema, passwordSchema } from '@automatize/form-validator';

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormInput = z.infer<typeof loginFormSchema>;

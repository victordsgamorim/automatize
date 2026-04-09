import { z } from 'zod';
import { emailSchema } from '../validators/email';
import { passwordSchema } from '../validators/password';

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormInput = z.infer<typeof loginFormSchema>;

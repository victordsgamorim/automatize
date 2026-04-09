import { z } from 'zod';
import { emailSchema } from '../validators/email';

export const resetPasswordFormSchema = z.object({
  email: emailSchema,
});

export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;

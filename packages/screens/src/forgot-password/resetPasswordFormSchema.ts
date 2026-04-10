import { z } from 'zod';
import { emailSchema } from '@automatize/form-validator';

export const resetPasswordFormSchema = z.object({
  email: emailSchema,
});

export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;

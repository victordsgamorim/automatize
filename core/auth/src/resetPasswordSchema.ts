import { z } from 'zod';

export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

export type ResetPasswordRequestInput = z.infer<
  typeof resetPasswordRequestSchema
>;

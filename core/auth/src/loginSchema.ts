import { z } from 'zod';

/**
 * Login form validation schema.
 *
 * Intentionally lean — login forms only need to verify that values were
 * provided and that the email is well-formed. Full password-strength rules
 * live in @automatize/supabase-auth's registerSchema.
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormInput = z.infer<typeof loginSchema>;

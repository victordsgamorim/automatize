import { z } from 'zod';

export const passwordSchema = z.string().min(1, 'Password is required');

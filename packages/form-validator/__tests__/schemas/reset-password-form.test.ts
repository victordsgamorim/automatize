import { describe, it, expect } from 'vitest';
import { resetPasswordFormSchema } from '../../src/schemas/reset-password-form';

describe('resetPasswordFormSchema', () => {
  it('accepts valid email', () => {
    const result = resetPasswordFormSchema.parse({
      email: 'user@example.com',
    });
    expect(result.email).toBe('user@example.com');
  });

  it('rejects invalid email', () => {
    expect(() =>
      resetPasswordFormSchema.parse({ email: 'not-email' })
    ).toThrow();
  });

  it('rejects empty email', () => {
    expect(() => resetPasswordFormSchema.parse({ email: '' })).toThrow();
  });
});

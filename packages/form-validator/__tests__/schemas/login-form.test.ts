import { describe, it, expect } from 'vitest';
import { loginFormSchema } from '../../src/schemas/login-form';

describe('loginFormSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginFormSchema.parse({
      email: 'user@example.com',
      password: 'secret',
    });
    expect(result.email).toBe('user@example.com');
    expect(result.password).toBe('secret');
  });

  it('rejects invalid email', () => {
    expect(() =>
      loginFormSchema.parse({ email: 'bad', password: 'secret' })
    ).toThrow();
  });

  it('rejects empty password', () => {
    expect(() =>
      loginFormSchema.parse({ email: 'user@example.com', password: '' })
    ).toThrow();
  });
});

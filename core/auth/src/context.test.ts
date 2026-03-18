import { describe, expect, it } from 'vitest';

import { AuthContext } from './context';

describe('AuthContext', () => {
  it('is a valid React context object', () => {
    expect(AuthContext).toBeDefined();
    expect(AuthContext).toHaveProperty('Provider');
    expect(AuthContext).toHaveProperty('Consumer');
  });
});

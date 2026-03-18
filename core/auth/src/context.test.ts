import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { AuthContext } from './context';

describe('AuthContext', () => {
  it('is a valid React context object', () => {
    expect(AuthContext).toBeDefined();
    expect(AuthContext).toHaveProperty('Provider');
    expect(AuthContext).toHaveProperty('Consumer');
  });

  it('has a default value of null', () => {
    const defaultValue = (AuthContext as React.Context<unknown>)._currentValue;
    expect(defaultValue).toBeNull();
  });
});

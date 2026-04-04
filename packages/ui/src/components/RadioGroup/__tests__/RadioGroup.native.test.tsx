import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

vi.mock('react-native', async () => {
  const { createElement } = await import('react');
  return {
    View: ({ children }: { children?: React.ReactNode }) =>
      createElement('div', null, children),
    Text: ({ children }: { children?: React.ReactNode }) =>
      createElement('span', null, children),
  };
});

import { RadioGroup, RadioGroupItem } from '../RadioGroup.native';

describe('RadioGroup (native placeholder)', () => {
  it('renders children inside RadioGroup', () => {
    const { getByText } = render(
      <RadioGroup>
        <RadioGroupItem value="option-a" />
      </RadioGroup>
    );
    expect(getByText('option-a')).toBeDefined();
  });

  it('renders each RadioGroupItem value as text', () => {
    const { getByText } = render(
      <RadioGroup>
        <RadioGroupItem value="one" />
        <RadioGroupItem value="two" />
      </RadioGroup>
    );
    expect(getByText('one')).toBeDefined();
    expect(getByText('two')).toBeDefined();
  });
});

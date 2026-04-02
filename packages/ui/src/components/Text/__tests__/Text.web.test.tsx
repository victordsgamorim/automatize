import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { Text } from '../Text.web';
import type { TextVariant, TextColor } from '../Text.web';

describe('Text (web)', () => {
  it('renders children', () => {
    render(<Text>Hello world</Text>);
    expect(screen.getByText('Hello world')).toBeDefined();
  });

  it('has data-slot="text"', () => {
    render(<Text>Hello</Text>);
    expect(document.querySelector('[data-slot="text"]')).toBeTruthy();
  });

  it('renders as <span> by default (body variant)', () => {
    const { container } = render(<Text>Body</Text>);
    expect(container.querySelector('span')).toBeTruthy();
  });

  it.each<[TextVariant, string]>([
    ['h1', 'H1'],
    ['h2', 'H2'],
    ['h3', 'H3'],
    ['body', 'SPAN'],
    ['bodySmall', 'SPAN'],
    ['caption', 'SPAN'],
    ['code', 'CODE'],
    ['label', 'LABEL'],
  ])('variant "%s" renders correct HTML element', (variant, expectedTag) => {
    const { container } = render(<Text variant={variant}>Text</Text>);
    expect(container.firstChild?.nodeName).toBe(expectedTag);
  });

  it.each<TextColor>([
    'primary',
    'secondary',
    'tertiary',
    'muted',
    'error',
    'success',
    'warning',
  ])('renders color "%s" without error', (color) => {
    const { container } = render(<Text color={color}>Text</Text>);
    expect(container.firstChild).toBeDefined();
  });

  it('renders as <label> when htmlFor is provided', () => {
    render(
      <>
        <Text htmlFor="email-input">Email</Text>
        <input id="email-input" type="email" />
      </>
    );
    const label = document.querySelector('label');
    expect(label).toBeTruthy();
    expect(label?.getAttribute('for')).toBe('email-input');
  });

  it('applies label styles when htmlFor is provided regardless of variant', () => {
    const { container } = render(
      <Text htmlFor="test" variant="body">
        Label text
      </Text>
    );
    expect(container.querySelector('label')).toBeTruthy();
  });

  it('applies custom className', () => {
    render(<Text className="my-custom-class">Text</Text>);
    const el = document.querySelector('[data-slot="text"]');
    expect(el?.className).toContain('my-custom-class');
  });

  it('renders children content including nested elements', () => {
    render(
      <Text>
        Password <span>*</span>
      </Text>
    );
    const el = document.querySelector('[data-slot="text"]');
    expect(el?.textContent).toBe('Password *');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Text ref={ref}>Content</Text>);
    expect(ref.current).toBeDefined();
  });
});

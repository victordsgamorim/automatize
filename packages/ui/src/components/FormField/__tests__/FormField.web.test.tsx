import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FormField } from '../FormField.web';

describe('FormField (web)', () => {
  it('renders the label text', () => {
    render(
      <FormField label="Email" htmlFor="email-input">
        <input id="email-input" />
      </FormField>
    );
    expect(screen.getByText('Email')).toBeDefined();
  });

  it('associates label with input via htmlFor', () => {
    render(
      <FormField label="Password" htmlFor="password-input">
        <input id="password-input" type="password" />
      </FormField>
    );
    const label = screen.getByText('Password').closest('label');
    expect(label?.getAttribute('for')).toBe('password-input');
  });

  it('renders children', () => {
    render(
      <FormField label="Name" htmlFor="name-input">
        <input id="name-input" placeholder="Enter name" />
      </FormField>
    );
    expect(screen.getByPlaceholderText('Enter name')).toBeDefined();
  });

  it('applies additional className to the wrapper', () => {
    const { container } = render(
      <FormField
        label="Email"
        htmlFor="email-input"
        className="my-custom-class"
      >
        <input id="email-input" />
      </FormField>
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      'my-custom-class'
    );
  });

  it('wrapper always has space-y-1.5 spacing', () => {
    const { container } = render(
      <FormField label="Email" htmlFor="email-input">
        <input id="email-input" />
      </FormField>
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      'space-y-1.5'
    );
  });

  it('label has pl-4 indentation', () => {
    render(
      <FormField label="Email" htmlFor="email-input">
        <input id="email-input" />
      </FormField>
    );
    const label = screen.getByText('Email').closest('label');
    expect(label?.className).toContain('pl-4');
  });
});

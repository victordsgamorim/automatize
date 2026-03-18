import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { Label } from '../Label.web';

describe('Label (web)', () => {
  it('renders label text', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeDefined();
  });

  it('has data-slot="label"', () => {
    render(<Label>Email</Label>);
    expect(document.querySelector('[data-slot="label"]')).toBeTruthy();
  });

  it('associates with a form element via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email-input">Email</Label>
        <input id="email-input" type="email" />
      </>
    );
    const label = document.querySelector('[data-slot="label"]');
    expect(label?.getAttribute('for')).toBe('email-input');
  });

  it('applies custom className', () => {
    render(<Label className="my-custom-class">Email</Label>);
    const label = document.querySelector('[data-slot="label"]');
    expect(label?.className).toContain('my-custom-class');
  });

  it('renders children content', () => {
    render(
      <Label>
        Password <span>*</span>
      </Label>
    );
    const label = document.querySelector('[data-slot="label"]');
    expect(label?.textContent).toBe('Password *');
  });
});

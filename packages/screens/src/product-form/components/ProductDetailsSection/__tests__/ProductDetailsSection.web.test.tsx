import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ProductDetailsSection } from '../ProductDetailsSection.web';
import type { ProductDetailsSectionProps } from '../ProductDetailsSection.web';

vi.mock('@automatize/ui/web', () => ({
  Input: ({
    id,
    value,
    onChange,
    label,
    placeholder,
    inputMode,
  }: {
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    placeholder?: string;
    inputMode?: string;
  }) => (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode as never}
        aria-label={label}
      />
    </div>
  ),
}));

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'product.name': 'Name',
        'product.name.placeholder': 'Product name',
        'product.price': 'Price',
        'product.price.placeholder': '0.00',
        'product.quantity': 'Quantity',
        'product.quantity.placeholder': '0',
        'product.info': 'Info',
        'product.info.placeholder': 'Additional information...',
      })[key] ?? key,
  }),
}));

const defaultProps: ProductDetailsSectionProps = {
  name: '',
  onNameChange: vi.fn(),
  price: '',
  onPriceChange: vi.fn(),
  quantity: '',
  onQuantityChange: vi.fn(),
  info: '',
  onInfoChange: vi.fn(),
};

function renderSection(props: Partial<ProductDetailsSectionProps> = {}) {
  return render(<ProductDetailsSection {...defaultProps} {...props} />);
}

describe('ProductDetailsSection (web)', () => {
  describe('rendering', () => {
    it('renders the name input with correct label', () => {
      renderSection();
      expect(screen.getByLabelText('Name')).toBeDefined();
    });

    it('renders the price input with correct label', () => {
      renderSection();
      expect(screen.getByLabelText('Price')).toBeDefined();
    });

    it('renders the quantity input with correct label', () => {
      renderSection();
      expect(screen.getByLabelText('Quantity')).toBeDefined();
    });

    it('renders the info input with correct label', () => {
      renderSection();
      expect(screen.getByLabelText('Info')).toBeDefined();
    });

    it('renders placeholders', () => {
      renderSection();
      expect(screen.getByPlaceholderText('Product name')).toBeDefined();
      expect(screen.getByPlaceholderText('0.00')).toBeDefined();
      expect(screen.getByPlaceholderText('0')).toBeDefined();
      expect(
        screen.getByPlaceholderText('Additional information...')
      ).toBeDefined();
    });

    it('displays provided values', () => {
      renderSection({
        name: 'Gadget X',
        price: '12.99',
        quantity: '5',
        info: 'Great product',
      });
      expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(
        'Gadget X'
      );
      expect((screen.getByLabelText('Price') as HTMLInputElement).value).toBe(
        '12.99'
      );
      expect(
        (screen.getByLabelText('Quantity') as HTMLInputElement).value
      ).toBe('5');
      expect((screen.getByLabelText('Info') as HTMLInputElement).value).toBe(
        'Great product'
      );
    });
  });

  describe('name changes', () => {
    it('calls onNameChange when name input changes', () => {
      const onNameChange = vi.fn();
      renderSection({ onNameChange });
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'New Product' },
      });
      expect(onNameChange).toHaveBeenCalledWith('New Product');
    });
  });

  describe('price changes', () => {
    it('calls onPriceChange with valid decimal input', () => {
      const onPriceChange = vi.fn();
      renderSection({ onPriceChange });
      fireEvent.change(screen.getByLabelText('Price'), {
        target: { value: '19.99' },
      });
      expect(onPriceChange).toHaveBeenCalledWith('19.99');
    });

    it('strips non-numeric characters from price', () => {
      const onPriceChange = vi.fn();
      renderSection({ onPriceChange });
      fireEvent.change(screen.getByLabelText('Price'), {
        target: { value: 'abc12.50xyz' },
      });
      expect(onPriceChange).toHaveBeenCalledWith('12.50');
    });

    it('normalises comma to dot in price', () => {
      const onPriceChange = vi.fn();
      renderSection({ onPriceChange });
      fireEvent.change(screen.getByLabelText('Price'), {
        target: { value: '10,99' },
      });
      expect(onPriceChange).toHaveBeenCalledWith('10.99');
    });
  });

  describe('quantity changes', () => {
    it('calls onQuantityChange with valid integer input', () => {
      const onQuantityChange = vi.fn();
      renderSection({ onQuantityChange });
      fireEvent.change(screen.getByLabelText('Quantity'), {
        target: { value: '42' },
      });
      expect(onQuantityChange).toHaveBeenCalledWith('42');
    });

    it('strips non-digit characters from quantity', () => {
      const onQuantityChange = vi.fn();
      renderSection({ onQuantityChange });
      fireEvent.change(screen.getByLabelText('Quantity'), {
        target: { value: '12.5abc' },
      });
      expect(onQuantityChange).toHaveBeenCalledWith('125');
    });
  });

  describe('info changes', () => {
    it('calls onInfoChange when info input changes', () => {
      const onInfoChange = vi.fn();
      renderSection({ onInfoChange });
      fireEvent.change(
        screen.getByPlaceholderText('Additional information...'),
        { target: { value: 'Some info' } }
      );
      expect(onInfoChange).toHaveBeenCalledWith('Some info');
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web
vi.mock('@automatize/ui/web', async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>('@automatize/ui/web');
  const { createElement } = await import('react');

  type WithChildren = { children?: React.ReactNode };

  const Popover = ({
    children,
    open,
    onOpenChange,
  }: WithChildren & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open
      ? createElement('div', { onClick: () => onOpenChange(false) }, children)
      : null;
  const PopoverTrigger = ({
    children,
    asChild,
  }: WithChildren & { asChild?: boolean }) => {
    if (asChild && React.isValidElement(children)) return children;
    return createElement('button', null, children);
  };
  const PopoverContent = ({
    children,
    className,
  }: WithChildren & { className?: string }) =>
    createElement('div', { className }, children);

  const Command = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const CommandInput = ({ placeholder }: { placeholder?: string }) =>
    createElement('input', { placeholder });
  const CommandList = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const CommandEmpty = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const CommandGroup = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const CommandItem = ({
    children,
    onSelect,
    disabled,
    className,
  }: WithChildren & {
    onSelect?: () => void;
    disabled?: boolean;
    className?: string;
  }) =>
    createElement(
      'div',
      { onClick: disabled ? undefined : onSelect, className },
      children
    );

  const Text = ({
    variant,
    color,
    className,
    children,
  }: {
    variant?: string;
    color?: string;
    className?: string;
    children?: React.ReactNode;
  }) => createElement('span', { variant, color, className }, children);

  const useToasts = (): {
    success: () => void;
    error: () => void;
    warning: () => void;
  } => ({
    success: () => {},
    error: () => {},
    warning: () => {},
  });

  const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

  const Check = () => createElement('span', { 'data-testid': 'check-icon' });
  const ChevronsUpDown = () =>
    createElement('span', { 'data-testid': 'chevrons-icon' });
  const Minus = () => createElement('span', { 'data-testid': 'minus-icon' });
  const Plus = () => createElement('span', { 'data-testid': 'plus-icon' });
  const Trash2 = () => createElement('span', { 'data-testid': 'trash-icon' });

  return {
    ...actual,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    Text,
    useToasts,
    cn,
    Check,
    ChevronsUpDown,
    Minus,
    Plus,
    Trash2,
  };
});

// Mock useTranslation
vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { ProductsSection } from '../ProductsSection.web';
import type {
  ProductRow,
  InvoiceProductItem,
} from '../../../InvoiceFormScreen.types';

const mockProducts: ProductRow[] = [
  { id: 'prod-1', name: 'Product A', price: 100, quantity: 10 },
  { id: 'prod-2', name: 'Product B', price: 50, quantity: 5 },
  { id: 'prod-3', name: 'Product C', price: 200, quantity: 0 },
];

const mockSelectedProducts: InvoiceProductItem[] = [
  {
    id: 'item-1',
    productId: 'prod-1',
    name: 'Product A',
    unitPrice: 100,
    quantity: 2,
    availableStock: 10,
    totalPrice: 200,
  },
];

function renderProductsSection(
  overrides: Partial<React.ComponentProps<typeof ProductsSection>> = {}
) {
  const onAddProduct = vi.fn();
  const onRemoveProduct = vi.fn();
  const onUpdateQuantity = vi.fn();
  const onIncrementQuantity = vi.fn();
  const onDecrementQuantity = vi.fn();

  const props = {
    availableProducts: mockProducts,
    selectedProducts: [],
    invoiceTotal: 0,
    onAddProduct,
    onRemoveProduct,
    onUpdateQuantity,
    onIncrementQuantity,
    onDecrementQuantity,
    ...overrides,
  };

  const result = render(<ProductsSection {...props} />);
  return {
    ...result,
    onAddProduct,
    onRemoveProduct,
    onUpdateQuantity,
    onIncrementQuantity,
    onDecrementQuantity,
  };
}

describe('ProductsSection (web)', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────
  it('renders products section header', () => {
    renderProductsSection();
    expect(screen.getByText(/invoice.products/i)).toBeDefined();
  });

  it('renders product search/select combobox', () => {
    renderProductsSection();
    expect(screen.getByRole('combobox')).toBeDefined();
    expect(screen.getByText(/invoice.products.placeholder/i)).toBeDefined();
  });

  it('shows empty state when no products are selected', () => {
    renderProductsSection({ selectedProducts: [] });
    expect(screen.getByText(/invoice.products.noProducts/i)).toBeDefined();
  });

  // ── Product Selection ───────────────────────────────────────────────────────
  it('shows all available products in dropdown', () => {
    renderProductsSection();
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    expect(screen.getByText('Product A')).toBeDefined();
    expect(screen.getByText('Product B')).toBeDefined();
  });

  it('shows out of stock status for products with zero quantity', () => {
    renderProductsSection();
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    expect(screen.getByText(/invoice.products.outOfStock/i)).toBeDefined();
  });

  it('calls onAddProduct when selecting a product', () => {
    const { onAddProduct } = renderProductsSection();
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);

    const productItem = screen.getByText('Product A');
    fireEvent.click(productItem);

    expect(onAddProduct).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'prod-1', name: 'Product A' })
    );
  });

  // ── Selected Products ─────────────────────────────────────────────────────
  it('renders selected products in table', () => {
    renderProductsSection({ selectedProducts: mockSelectedProducts });
    expect(screen.getByText('Product A')).toBeDefined();
    expect(screen.getByDisplayValue('2')).toBeDefined();
  });

  it('renders formatted unit price', () => {
    renderProductsSection({ selectedProducts: mockSelectedProducts });
    expect(screen.getByText('R$ 100,00')).toBeDefined();
  });

  it('renders formatted total price', () => {
    renderProductsSection({ selectedProducts: mockSelectedProducts });
    expect(screen.getByText('R$ 200,00')).toBeDefined();
  });

  // ── Quantity Controls ──────────────────────────────────────────────────────
  it('calls onDecrementQuantity when decrement button is clicked', () => {
    const { onDecrementQuantity } = renderProductsSection({
      selectedProducts: mockSelectedProducts,
    });
    const decrementButton = screen.getByRole('button', {
      name: /decrease quantity/i,
    });
    fireEvent.click(decrementButton);
    expect(onDecrementQuantity).toHaveBeenCalledWith('item-1');
  });

  it('calls onIncrementQuantity when increment button is clicked', () => {
    const { onIncrementQuantity } = renderProductsSection({
      selectedProducts: mockSelectedProducts,
    });
    const incrementButton = screen.getByRole('button', {
      name: /increase quantity/i,
    });
    fireEvent.click(incrementButton);
    expect(onIncrementQuantity).toHaveBeenCalledWith('item-1');
  });

  it('calls onRemoveProduct when remove button is clicked', () => {
    const { onRemoveProduct } = renderProductsSection({
      selectedProducts: mockSelectedProducts,
    });
    const removeButton = screen.getByRole('button', {
      name: /invoice.products.remove/i,
    });
    fireEvent.click(removeButton);
    expect(onRemoveProduct).toHaveBeenCalledWith('item-1');
  });

  // ── Total ───────────────────────────────────────────────────────────────────
  it('displays invoice total', () => {
    renderProductsSection({
      selectedProducts: mockSelectedProducts,
      invoiceTotal: 200,
    });
    expect(screen.getByText(/invoice.form.total/i)).toBeDefined();
    expect(screen.getByText('R$ 200,00')).toBeDefined();
  });

  // ── Stock Validation ────────────────────────────────────────────────────────
  it('disables decrement button when quantity is 1', () => {
    const singleProduct: InvoiceProductItem[] = [
      {
        id: 'item-1',
        productId: 'prod-1',
        name: 'Product A',
        unitPrice: 100,
        quantity: 1,
        availableStock: 10,
        totalPrice: 100,
      },
    ];
    renderProductsSection({ selectedProducts: singleProduct });
    const decrementButton = screen.getByRole('button', {
      name: /decrease quantity/i,
    });
    expect(decrementButton).toBeDisabled();
  });

  it('disables increment button when quantity equals available stock', () => {
    const maxedProduct: InvoiceProductItem[] = [
      {
        id: 'item-1',
        productId: 'prod-1',
        name: 'Product A',
        unitPrice: 100,
        quantity: 10,
        availableStock: 10,
        totalPrice: 1000,
      },
    ];
    renderProductsSection({ selectedProducts: maxedProduct });
    const incrementButton = screen.getByRole('button', {
      name: /increase quantity/i,
    });
    expect(incrementButton).toBeDisabled();
  });
});

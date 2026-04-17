import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ProductScreen } from '../ProductScreen.web';
import type { ProductScreenProps, ProductRow } from '../ProductScreen.types';

vi.mock('@automatize/ui/web', () => ({
  SecondaryButton: ({
    children,
    onClick,
    className,
    ...rest
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    size?: string;
    'aria-label'?: string;
  }) => (
    <button
      onClick={onClick}
      className={className}
      data-variant="secondary"
      {...rest}
    >
      {children}
    </button>
  ),
  PrimaryButton: ({
    children,
    onClick,
    className,
    ...rest
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    size?: string;
    'aria-label'?: string;
  }) => (
    <button
      onClick={onClick}
      className={className}
      data-variant="primary"
      {...rest}
    >
      {children}
    </button>
  ),
  Input: ({
    onChange,
    value,
    placeholder,
    className,
    ...rest
  }: {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    placeholder?: string;
    className?: string;
    'aria-label'?: string;
  }) => (
    <input
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      className={className}
      {...rest}
    />
  ),
  Table: ({
    columns,
    data,
    toolbarLeft,
    toolbarRight,
    emptyMessage,
    onRowClick,
    getItemId,
  }: {
    columns: {
      key: keyof ProductRow;
      header: string;
      sortable?: boolean;
      render?: (item: ProductRow) => React.ReactNode;
    }[];
    data: ProductRow[];
    toolbarLeft?: React.ReactNode;
    toolbarRight?: React.ReactNode;
    emptyMessage?: string;
    onRowClick?: (item: ProductRow) => void;
    getItemId: (item: ProductRow) => string;
    selectable?: boolean;
    itemLabel?: string;
    previousLabel?: string;
    nextLabel?: string;
    pageLabel?: (current: number, total: number) => string;
  }) => (
    <div data-testid="table">
      {toolbarLeft && <div data-testid="toolbar-left">{toolbarLeft}</div>}
      {toolbarRight && <div data-testid="toolbar-right">{toolbarRight}</div>}
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key as string} data-sortable={col.sortable}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>{emptyMessage}</td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={getItemId(item)}
                onClick={() => onRowClick?.(item)}
                data-testid={`row-${getItemId(item)}`}
              >
                {columns.map((col) => (
                  <td key={col.key as string}>
                    {col.render
                      ? col.render(item)
                      : String(item[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  ),
  Drawer: ({
    open,
    title,
    children,
    footer,
    onClose,
  }: {
    open?: boolean;
    title?: React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    onClose?: () => void;
  }) =>
    open ? (
      <div data-testid="drawer">
        <div data-testid="drawer-title">{title}</div>
        <div data-testid="drawer-content">{children}</div>
        {footer ? <div data-testid="drawer-footer">{footer}</div> : null}
        <button aria-label="Close" onClick={onClose} />
      </div>
    ) : null,
  BottomSheet: ({
    open,
    title,
    children,
    footer,
    onClose,
  }: {
    open?: boolean;
    title?: React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    onClose?: () => void;
  }) =>
    open ? (
      <div data-testid="bottom-sheet">
        <div data-testid="bottom-sheet-title">{title}</div>
        <div data-testid="bottom-sheet-content">{children}</div>
        {footer ? <div data-testid="bottom-sheet-footer">{footer}</div> : null}
        <button aria-label="Close" onClick={onClose} />
      </div>
    ) : null,
  Separator: () => <hr />,
  Text: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
    variant?: string;
    color?: string;
  }) => <span className={className}>{children}</span>,
}));

vi.mock('@automatize/ui/responsive', () => ({
  useResponsive: () => ({ isMobile: false }),
}));

const translationMap: Record<string, string> = {
  'product.table.name': 'Name',
  'product.table.quantity': 'Quantity',
  'product.table.price': 'Price',
  'product.list.search': 'Search products...',
  'product.list.add': 'New Product',
  'product.list.empty': 'No products registered yet',
  'product.list.itemLabel': 'products',
  'product.list.previous': 'Previous',
  'product.list.next': 'Next',
  'product.list.page': 'Page {{current}} of {{total}}',
  'product.company': 'Company',
  'product.price': 'Price',
  'product.quantity': 'Quantity',
  'product.info': 'Info',
  'product.detail.edit': 'Edit',
  'product.photo.none': 'No photo',
};

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      let result = translationMap[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, v);
        });
      }
      return result;
    },
    language: 'en',
    changeLanguage: vi.fn(),
  }),
}));

const mockProducts: ProductRow[] = [
  {
    id: '1',
    name: 'Widget A',
    quantity: 10,
    price: 29.99,
    companyName: 'Acme Corp',
    info: 'A useful widget',
  },
  {
    id: '2',
    name: 'Gadget B',
    quantity: 5,
    price: 49.99,
    companyName: 'TechCo',
  },
  {
    id: '3',
    name: 'Doohickey C',
    quantity: 100,
    price: 9.99,
    info: 'Tiny but mighty',
  },
];

const defaultProps: ProductScreenProps = {
  products: mockProducts,
  onAddProduct: vi.fn(),
  locale: {
    languages: [{ code: 'en', label: 'English', ext: 'US' }],
    currentLanguage: 'en',
    onLanguageChange: vi.fn(),
  },
};

function renderScreen(props: Partial<ProductScreenProps> = {}) {
  return render(<ProductScreen {...defaultProps} {...props} />);
}

describe('ProductScreen (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the table', () => {
      renderScreen();
      expect(screen.getByTestId('table')).toBeDefined();
    });

    it('renders all column headers', () => {
      renderScreen();
      expect(screen.getByText('Name')).toBeDefined();
      expect(screen.getByText('Quantity')).toBeDefined();
      expect(screen.getByText('Price')).toBeDefined();
    });

    it('renders all product rows', () => {
      renderScreen();
      expect(screen.getByTestId('row-1')).toBeDefined();
      expect(screen.getByTestId('row-2')).toBeDefined();
      expect(screen.getByTestId('row-3')).toBeDefined();
    });

    it('renders product names', () => {
      renderScreen();
      expect(screen.getByText('Widget A')).toBeDefined();
      expect(screen.getByText('Gadget B')).toBeDefined();
      expect(screen.getByText('Doohickey C')).toBeDefined();
    });

    it('renders empty message when no products', () => {
      renderScreen({ products: [] });
      expect(screen.getByText('No products registered yet')).toBeDefined();
    });

    it('marks all columns as sortable', () => {
      renderScreen();
      const headers = screen.getAllByRole('columnheader');
      headers.forEach((header) => {
        expect(header.getAttribute('data-sortable')).toBe('true');
      });
    });

    it('does not render drawer when no row is clicked', () => {
      renderScreen();
      expect(screen.queryByTestId('drawer')).toBeNull();
    });
  });

  describe('toolbar', () => {
    it('renders search bar in toolbar left', () => {
      renderScreen();
      const toolbarLeft = screen.getByTestId('toolbar-left');
      const searchInput = toolbarLeft.querySelector('input');
      expect(searchInput).toBeDefined();
      expect(searchInput?.getAttribute('placeholder')).toBe(
        'Search products...'
      );
    });

    it('renders add button in toolbar right', () => {
      renderScreen();
      const toolbarRight = screen.getByTestId('toolbar-right');
      expect(toolbarRight.querySelector('button')).toBeDefined();
    });

    it('add button has correct aria-label', () => {
      renderScreen();
      expect(screen.getByLabelText('New Product')).toBeDefined();
    });
  });

  describe('search filtering', () => {
    it('filters products by name', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'Widget' } });
      expect(screen.getByTestId('row-1')).toBeDefined();
      expect(screen.queryByTestId('row-2')).toBeNull();
      expect(screen.queryByTestId('row-3')).toBeNull();
    });

    it('filters products by company name', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'TechCo' } });
      expect(screen.queryByTestId('row-1')).toBeNull();
      expect(screen.getByTestId('row-2')).toBeDefined();
      expect(screen.queryByTestId('row-3')).toBeNull();
    });

    it('filters products by info', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'mighty' } });
      expect(screen.queryByTestId('row-1')).toBeNull();
      expect(screen.queryByTestId('row-2')).toBeNull();
      expect(screen.getByTestId('row-3')).toBeDefined();
    });

    it('is case insensitive', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'widget' } });
      expect(screen.getByTestId('row-1')).toBeDefined();
    });

    it('shows all products when search is cleared', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, { target: { value: 'Widget' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByTestId('row-1')).toBeDefined();
      expect(screen.getByTestId('row-2')).toBeDefined();
      expect(screen.getByTestId('row-3')).toBeDefined();
    });

    it('shows empty state when search has no matches', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.change(searchInput, {
        target: { value: 'zzzznonexistent' },
      });
      expect(screen.getByText('No products registered yet')).toBeDefined();
    });
  });

  describe('row detail drawer', () => {
    it('opens drawer when a row is clicked', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      expect(screen.getByTestId('drawer')).toBeDefined();
    });

    it('shows product name as drawer title', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      expect(screen.getByTestId('drawer-title').textContent).toBe('Widget A');
    });

    it('shows company name in drawer content when present', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      const content = screen.getByTestId('drawer-content');
      expect(content.textContent?.includes('Acme Corp')).toBe(true);
    });

    it('shows info in drawer content when present', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      const content = screen.getByTestId('drawer-content');
      expect(content.textContent?.includes('A useful widget')).toBe(true);
    });

    it('shows "No photo" placeholder when product has no photo', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      const content = screen.getByTestId('drawer-content');
      expect(content.textContent?.includes('No photo')).toBe(true);
    });

    it('does not show company section when companyName is absent', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-3'));
      const content = screen.getByTestId('drawer-content');
      expect(content.textContent?.includes('Acme Corp')).toBe(false);
      expect(content.textContent?.includes('TechCo')).toBe(false);
    });

    it('closes drawer when Close button is clicked', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      expect(screen.getByTestId('drawer')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByTestId('drawer')).toBeNull();
    });

    it('switches detail when another row is clicked after closing', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      expect(screen.getByTestId('drawer-title').textContent).toBe('Widget A');
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      fireEvent.click(screen.getByTestId('row-2'));
      expect(screen.getByTestId('drawer-title').textContent).toBe('Gadget B');
    });
  });

  describe('edit action', () => {
    it('calls onEditProduct with correct product when Edit is clicked', () => {
      const onEditProduct = vi.fn();
      renderScreen({ onEditProduct });
      fireEvent.click(screen.getByTestId('row-1'));
      fireEvent.click(screen.getByText('Edit'));
      expect(onEditProduct).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('closes drawer after Edit is clicked', () => {
      const onEditProduct = vi.fn();
      renderScreen({ onEditProduct });
      fireEvent.click(screen.getByTestId('row-1'));
      fireEvent.click(screen.getByText('Edit'));
      expect(screen.queryByTestId('drawer')).toBeNull();
    });

    it('does not crash when onEditProduct is not provided', () => {
      renderScreen({ onEditProduct: undefined });
      fireEvent.click(screen.getByTestId('row-1'));
      fireEvent.click(screen.getByText('Edit'));
      expect(screen.queryByTestId('drawer')).toBeNull();
    });
  });

  describe('interactions', () => {
    it('calls onAddProduct when add button is clicked', () => {
      const onAddProduct = vi.fn();
      renderScreen({ onAddProduct });
      fireEvent.click(screen.getByLabelText('New Product'));
      expect(onAddProduct).toHaveBeenCalledOnce();
    });
  });

  describe('price and quantity overflow layout', () => {
    const largeNumberProduct: ProductRow = {
      id: '99',
      name: 'Big Number Product',
      quantity: 123123123123,
      price: 123123123123.99,
      companyName: 'Corp',
    };

    it('price and quantity are in separate rows (not side-by-side)', () => {
      renderScreen({ products: [largeNumberProduct] });
      fireEvent.click(screen.getByTestId('row-99'));
      const content = screen.getByTestId('drawer-content');
      const tiles = content.querySelectorAll(
        '.rounded-lg.border.border-border'
      );
      // both price and quantity tiles must exist
      expect(tiles.length).toBeGreaterThanOrEqual(2);
      // they must NOT share a grid-cols-2 parent
      const gridParent = content.querySelector('.grid-cols-2');
      expect(gridParent).toBeNull();
    });

    it('price value element has truncate class for overflow suppression', () => {
      renderScreen({ products: [largeNumberProduct] });
      fireEvent.click(screen.getByTestId('row-99'));
      const content = screen.getByTestId('drawer-content');
      // find the span that contains the formatted price value
      const allSpans = Array.from(content.querySelectorAll('span'));
      const priceSpan = allSpans.find(
        (el) =>
          el.textContent?.includes('123') && el.classList.contains('truncate')
      );
      expect(priceSpan).toBeDefined();
    });

    it('quantity value element has truncate class for overflow suppression', () => {
      renderScreen({ products: [largeNumberProduct] });
      fireEvent.click(screen.getByTestId('row-99'));
      const content = screen.getByTestId('drawer-content');
      const allSpans = Array.from(content.querySelectorAll('span'));
      const qtySpan = allSpans.find(
        (el) =>
          el.textContent === '123123123123' && el.classList.contains('truncate')
      );
      expect(qtySpan).toBeDefined();
    });

    it('renders large price value without throwing', () => {
      expect(() => {
        renderScreen({ products: [largeNumberProduct] });
        fireEvent.click(screen.getByTestId('row-99'));
      }).not.toThrow();
    });

    it('renders large quantity value without throwing', () => {
      renderScreen({ products: [largeNumberProduct] });
      fireEvent.click(screen.getByTestId('row-99'));
      const content = screen.getByTestId('drawer-content');
      expect(content.textContent?.includes('123123123123')).toBe(true);
    });

    it('price and quantity tiles each have flex-1 for proper width containment', () => {
      renderScreen({ products: [largeNumberProduct] });
      fireEvent.click(screen.getByTestId('row-99'));
      const content = screen.getByTestId('drawer-content');
      const flexOneEls = content.querySelectorAll('.flex-1.min-w-0');
      // at least price and quantity text containers should have flex-1 min-w-0
      expect(flexOneEls.length).toBeGreaterThanOrEqual(2);
    });
  });
});

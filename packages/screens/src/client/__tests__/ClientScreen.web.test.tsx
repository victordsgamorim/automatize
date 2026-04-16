import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ClientScreen } from '../ClientScreen.web';
import type { ClientScreenProps, ClientRow } from '../ClientScreen.types';

vi.mock('@automatize/ui/web', () => ({
  Button: ({
    children,
    onClick,
    className,
    ...rest
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: string;
    size?: string;
    'aria-label'?: string;
  }) => (
    <button onClick={onClick} className={className} {...rest}>
      {children}
    </button>
  ),
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
      key: keyof ClientRow;
      header: string;
      sortable?: boolean;
      render?: (item: ClientRow) => React.ReactNode;
    }[];
    data: ClientRow[];
    toolbarLeft?: React.ReactNode;
    toolbarRight?: React.ReactNode;
    emptyMessage?: string;
    onRowClick?: (item: ClientRow) => void;
    getItemId: (item: ClientRow) => string;
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
              <th key={col.key} data-sortable={col.sortable}>
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
                  <td key={col.key}>
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
    onClose,
  }: {
    open?: boolean;
    title?: React.ReactNode;
    children?: React.ReactNode;
    onClose?: () => void;
  }) =>
    open ? (
      <div data-testid="drawer">
        <div data-testid="drawer-title">{title}</div>
        <div data-testid="drawer-content">{children}</div>
        <button aria-label="Close" onClick={onClose} />
      </div>
    ) : null,
  BottomSheet: ({
    open,
    title,
    children,
    onClose,
  }: {
    open?: boolean;
    title?: React.ReactNode;
    children?: React.ReactNode;
    onClose?: () => void;
  }) =>
    open ? (
      <div data-testid="bottom-sheet">
        <div data-testid="bottom-sheet-title">{title}</div>
        <div data-testid="bottom-sheet-content">{children}</div>
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
  }) => <span className={className}>{children}</span>,
}));

vi.mock('@automatize/ui/responsive', () => ({
  useResponsive: () => ({ isMobile: false }),
}));

const translationMap: Record<string, string> = {
  'client.table.name': 'Client Name',
  'client.table.addresses': 'Addresses',
  'client.table.phones': 'Phone Number',
  'client.list.search': 'Search clients...',
  'client.list.add': 'New Client',
  'client.list.empty': 'No clients registered yet',
  'client.list.itemLabel': 'clients',
  'client.list.previous': 'Previous',
  'client.list.next': 'Next',
  'client.list.page': 'Page {{current}} of {{total}}',
  'client.addresses': 'Addresses',
  'client.phones': 'Phones',
  'client.detail.edit': 'Edit',
  'client.detail.noAddresses': 'No addresses',
  'client.detail.noPhones': 'No phones',
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

const mockClients: ClientRow[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    addresses: [
      {
        id: 'a1',
        street: 'Maple Avenue',
        number: '100',
        neighborhood: 'Downtown',
        city: 'New York',
        state: 'NY',
      },
    ],
    phones: [{ id: 'p1', number: '(11) 99999-0001' }],
  },
  {
    id: '2',
    name: 'Bob Smith',
    addresses: [
      {
        id: 'a2',
        street: 'Oak Street',
        number: '200',
        neighborhood: 'Midtown',
        city: 'Chicago',
        state: 'IL',
      },
    ],
    phones: [{ id: 'p2', number: '(11) 99999-0002' }],
  },
  {
    id: '3',
    name: 'Charlie Brown',
    addresses: [
      {
        id: 'a3',
        street: 'Pine Road',
        number: '300',
        neighborhood: 'Uptown',
        city: 'Los Angeles',
        state: 'CA',
      },
    ],
    phones: [{ id: 'p3', number: '(11) 99999-0003' }],
  },
];

const defaultProps: ClientScreenProps = {
  clients: mockClients,
  onAddClient: vi.fn(),
  locale: {
    languages: [{ code: 'en', label: 'English', ext: 'US' }],
    currentLanguage: 'en',
    onLanguageChange: vi.fn(),
  },
};

function renderScreen(props: Partial<ClientScreenProps> = {}) {
  return render(<ClientScreen {...defaultProps} {...props} />);
}

describe('ClientScreen (web)', () => {
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
      expect(screen.getByText('Client Name')).toBeDefined();
      expect(screen.getByText('Addresses')).toBeDefined();
      expect(screen.getByText('Phone Number')).toBeDefined();
    });

    it('renders all client rows', () => {
      renderScreen();
      expect(screen.getByTestId('row-1')).toBeDefined();
      expect(screen.getByTestId('row-2')).toBeDefined();
      expect(screen.getByTestId('row-3')).toBeDefined();
    });

    it('renders client names', () => {
      renderScreen();
      expect(screen.getByText('Alice Johnson')).toBeDefined();
      expect(screen.getByText('Bob Smith')).toBeDefined();
      expect(screen.getByText('Charlie Brown')).toBeDefined();
    });

    it('renders formatted addresses', () => {
      renderScreen();
      expect(
        screen.getByText('Maple Avenue, 100, Downtown, New York, NY')
      ).toBeDefined();
    });

    it('renders formatted phone numbers', () => {
      renderScreen();
      expect(screen.getByText('(11) 99999-0001')).toBeDefined();
    });

    it('renders empty message when no clients', () => {
      renderScreen({ clients: [] });
      expect(screen.getByText('No clients registered yet')).toBeDefined();
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
        'Search clients...'
      );
    });

    it('renders add button in toolbar right', () => {
      renderScreen();
      const toolbarRight = screen.getByTestId('toolbar-right');
      expect(toolbarRight.querySelector('button')).toBeDefined();
    });

    it('add button has correct aria-label', () => {
      renderScreen();
      expect(screen.getByLabelText('New Client')).toBeDefined();
    });
  });

  describe('search filtering', () => {
    it('filters clients by name', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search clients...');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      expect(screen.getByTestId('row-1')).toBeDefined();
      expect(screen.queryByTestId('row-2')).toBeNull();
      expect(screen.queryByTestId('row-3')).toBeNull();
    });

    it('filters clients by phone number', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search clients...');
      fireEvent.change(searchInput, { target: { value: '0002' } });
      expect(screen.queryByTestId('row-1')).toBeNull();
      expect(screen.getByTestId('row-2')).toBeDefined();
      expect(screen.queryByTestId('row-3')).toBeNull();
    });

    it('filters clients by address (city)', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search clients...');
      fireEvent.change(searchInput, { target: { value: 'Chicago' } });
      expect(screen.queryByTestId('row-1')).toBeNull();
      expect(screen.getByTestId('row-2')).toBeDefined();
      expect(screen.queryByTestId('row-3')).toBeNull();
    });

    it('filters clients by address (street)', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search clients...');
      fireEvent.change(searchInput, { target: { value: 'Pine' } });
      expect(screen.queryByTestId('row-1')).toBeNull();
      expect(screen.queryByTestId('row-2')).toBeNull();
      expect(screen.getByTestId('row-3')).toBeDefined();
    });

    it('is case insensitive', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search clients...');
      fireEvent.change(searchInput, { target: { value: 'alice' } });
      expect(screen.getByTestId('row-1')).toBeDefined();
    });

    it('shows all clients when search is cleared', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search clients...');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByTestId('row-1')).toBeDefined();
      expect(screen.getByTestId('row-2')).toBeDefined();
      expect(screen.getByTestId('row-3')).toBeDefined();
    });

    it('shows empty state when search has no matches', () => {
      renderScreen();
      const searchInput = screen.getByPlaceholderText('Search clients...');
      fireEvent.change(searchInput, { target: { value: 'zzzznonexistent' } });
      expect(screen.getByText('No clients registered yet')).toBeDefined();
    });
  });

  describe('row detail drawer', () => {
    it('opens drawer when a row is clicked', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      expect(screen.getByTestId('drawer')).toBeDefined();
    });

    it('shows client name as drawer title', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      expect(screen.getByTestId('drawer-title').textContent).toBe(
        'Alice Johnson'
      );
    });

    it('shows formatted address in drawer content', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      const content = screen.getByTestId('drawer-content');
      const text = content.textContent ?? '';
      expect(text.includes('Maple Avenue, 100')).toBe(true);
      expect(text.includes('Downtown')).toBe(true);
      expect(text.includes('New York - NY')).toBe(true);
    });

    it('shows phone number in drawer content', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      const content = screen.getByTestId('drawer-content');
      expect(content.textContent?.includes('(11) 99999-0001')).toBe(true);
    });

    it('shows "No addresses" for client with no addresses', () => {
      const clientNoAddresses: ClientRow = {
        id: '99',
        name: 'Empty',
        addresses: [],
        phones: [],
      };
      renderScreen({ clients: [clientNoAddresses] });
      fireEvent.click(screen.getByTestId('row-99'));
      expect(screen.getByTestId('drawer-content').textContent).toContain(
        'No addresses'
      );
    });

    it('shows "No phones" for client with no phones', () => {
      const clientNoPhones: ClientRow = {
        id: '99',
        name: 'Empty',
        addresses: [],
        phones: [],
      };
      renderScreen({ clients: [clientNoPhones] });
      fireEvent.click(screen.getByTestId('row-99'));
      expect(screen.getByTestId('drawer-content').textContent).toContain(
        'No phones'
      );
    });

    it('closes drawer when Close button is clicked', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      expect(screen.getByTestId('drawer')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByTestId('drawer')).toBeNull();
    });

    it('opens different client detail when another row is clicked', () => {
      renderScreen();
      fireEvent.click(screen.getByTestId('row-1'));
      expect(screen.getByTestId('drawer-title').textContent).toBe(
        'Alice Johnson'
      );
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      fireEvent.click(screen.getByTestId('row-2'));
      expect(screen.getByTestId('drawer-title').textContent).toBe('Bob Smith');
    });
  });

  describe('edit action', () => {
    it('calls onEditClient with correct client when Edit is clicked', () => {
      const onEditClient = vi.fn();
      renderScreen({ onEditClient });
      fireEvent.click(screen.getByTestId('row-1'));
      fireEvent.click(screen.getByText('Edit'));
      expect(onEditClient).toHaveBeenCalledWith(mockClients[0]);
    });

    it('closes drawer after Edit is clicked', () => {
      const onEditClient = vi.fn();
      renderScreen({ onEditClient });
      fireEvent.click(screen.getByTestId('row-1'));
      fireEvent.click(screen.getByText('Edit'));
      expect(screen.queryByTestId('drawer')).toBeNull();
    });

    it('does not crash when onEditClient is not provided', () => {
      renderScreen({ onEditClient: undefined });
      fireEvent.click(screen.getByTestId('row-1'));
      fireEvent.click(screen.getByText('Edit'));
      expect(screen.queryByTestId('drawer')).toBeNull();
    });
  });

  describe('interactions', () => {
    it('calls onAddClient when add button is clicked', () => {
      const onAddClient = vi.fn();
      renderScreen({ onAddClient });
      fireEvent.click(screen.getByLabelText('New Client'));
      expect(onAddClient).toHaveBeenCalledOnce();
    });
  });
});

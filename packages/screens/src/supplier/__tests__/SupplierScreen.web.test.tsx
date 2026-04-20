import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { SupplierScreen } from '../SupplierScreen.web';
import type { SupplierScreenProps, SupplierRow } from '../SupplierScreen.types';

vi.mock('@automatize/ui/web', () => ({
  Input: ({
    onChange,
    value,
    placeholder,
    className,
    id,
    onKeyDown,
    'aria-label': ariaLabel,
    ...rest
  }: {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    placeholder?: string;
    className?: string;
    id?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    'aria-label'?: string;
  }) => (
    <input
      id={id}
      data-testid="input"
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      className={className}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      {...rest}
    />
  ),
  PrimaryButton: ({
    children,
    onClick,
    disabled,
    type,
    ...rest
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    'aria-label'?: string;
  }) => (
    <button
      data-testid="primary-button"
      onClick={onClick}
      disabled={disabled}
      type={type ?? 'button'}
      {...rest}
    >
      {children}
    </button>
  ),
  SecondaryButton: ({
    children,
    onClick,
    disabled,
    type,
    size: _size,
    ...rest
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    size?: 'icon' | 'sm' | 'default';
    'aria-label'?: string;
  }) => (
    <button
      data-testid="secondary-button"
      onClick={onClick}
      disabled={disabled}
      type={type ?? 'button'}
      {...rest}
    >
      {children}
    </button>
  ),
  Table: ({
    columns,
    data,
    emptyMessage,
    getItemId,
    toolbarLeft,
    toolbarRight,
  }: {
    columns: {
      key: string;
      header: string;
      sortable?: boolean;
      render?: (item: SupplierRow) => React.ReactNode;
    }[];
    data: SupplierRow[];
    emptyMessage?: string;
    getItemId: (item: SupplierRow) => string;
    selectable?: boolean;
    itemLabel?: string;
    previousLabel?: string;
    nextLabel?: string;
    pageLabel?: (current: number, total: number) => string;
    toolbarLeft?: React.ReactNode;
    toolbarRight?: React.ReactNode;
  }) => (
    <div data-testid="table">
      <div data-testid="toolbar-left">{toolbarLeft}</div>
      <div data-testid="toolbar-right">{toolbarRight}</div>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
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
              <tr key={getItemId(item)} data-testid={`row-${getItemId(item)}`}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(item)
                      : String(
                          (item as unknown as Record<string, unknown>)[
                            col.key
                          ] ?? ''
                        )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  ),
  Dialog: ({
    open,
    onOpenChange: _onOpenChange,
    children,
  }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }) => (
    <div data-testid="dialog" data-open={String(!!open)}>
      {open ? children : null}
    </div>
  ),
  DialogContent: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogFooter: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}));

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const map: Record<string, string> = {
        'supplier.table.name': 'Name',
        'supplier.list.empty': 'No suppliers registered yet',
        'supplier.list.itemLabel': 'suppliers',
        'supplier.list.previous': 'Previous',
        'supplier.list.next': 'Next',
        'supplier.list.page': 'Page {{current}} of {{total}}',
        'supplier.list.search': 'Search suppliers...',
        'supplier.list.add': 'Add supplier',
        'supplier.form.name': 'Name',
        'supplier.form.namePlaceholder': 'Supplier name',
        'supplier.form.add': 'Add',
        'supplier.form.save': 'Save',
        'supplier.form.cancel': 'Cancel',
        'supplier.action.edit': 'Edit supplier',
        'supplier.action.delete': 'Delete supplier',
        'supplier.dialog.title': 'Add Supplier',
        'supplier.dialog.description':
          "Enter the supplier's name to add them to the list.",
      };
      let result = map[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, v);
        });
      }
      return result;
    },
  }),
}));

const mockSuppliers: SupplierRow[] = [
  { id: '1', name: 'Acme Corp' },
  { id: '2', name: 'TechCo' },
  { id: '3', name: 'Global Supplies' },
];

const defaultProps: SupplierScreenProps = {
  suppliers: mockSuppliers,
  onAdd: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

function renderScreen(props: Partial<SupplierScreenProps> = {}) {
  return render(<SupplierScreen {...defaultProps} {...props} />);
}

describe('SupplierScreen (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the table', () => {
      renderScreen();
      expect(screen.getByTestId('table')).toBeDefined();
    });

    it('renders column headers', () => {
      renderScreen();
      expect(screen.getAllByText('Name').length).toBeGreaterThanOrEqual(1);
    });

    it('renders all supplier rows', () => {
      renderScreen();
      expect(screen.getByTestId('row-1')).toBeDefined();
      expect(screen.getByTestId('row-2')).toBeDefined();
      expect(screen.getByTestId('row-3')).toBeDefined();
    });

    it('renders supplier names', () => {
      renderScreen();
      expect(screen.getByText('Acme Corp')).toBeDefined();
      expect(screen.getByText('TechCo')).toBeDefined();
      expect(screen.getByText('Global Supplies')).toBeDefined();
    });

    it('renders empty message when no suppliers', () => {
      renderScreen({ suppliers: [] });
      expect(screen.getByText('No suppliers registered yet')).toBeDefined();
    });

    it('renders the toolbar with search input', () => {
      renderScreen();
      expect(screen.getByTestId('toolbar-left')).toBeDefined();
    });

    it('renders the toolbar with add button', () => {
      renderScreen();
      expect(screen.getByTestId('toolbar-right')).toBeDefined();
    });
  });

  describe('search filtering', () => {
    it('shows all suppliers when search is empty', () => {
      renderScreen();
      expect(screen.getByTestId('row-1')).toBeDefined();
      expect(screen.getByTestId('row-2')).toBeDefined();
      expect(screen.getByTestId('row-3')).toBeDefined();
    });

    it('filters suppliers by name', () => {
      renderScreen();
      const searchInput = screen.getAllByTestId('input')[0];
      fireEvent.change(searchInput, { target: { value: 'Acme' } });
      expect(screen.getByTestId('row-1')).toBeDefined();
      expect(screen.queryByTestId('row-2')).toBeNull();
      expect(screen.queryByTestId('row-3')).toBeNull();
    });

    it('is case-insensitive', () => {
      renderScreen();
      const searchInput = screen.getAllByTestId('input')[0];
      fireEvent.change(searchInput, { target: { value: 'acme' } });
      expect(screen.getByTestId('row-1')).toBeDefined();
    });

    it('shows no results when search does not match', () => {
      renderScreen();
      const searchInput = screen.getAllByTestId('input')[0];
      fireEvent.change(searchInput, { target: { value: 'XYZ123' } });
      expect(screen.queryByTestId('row-1')).toBeNull();
    });
  });

  describe('add dialog', () => {
    it('opens dialog when add button is clicked', () => {
      renderScreen();
      const addBtn = screen.getByLabelText('Add supplier');
      fireEvent.click(addBtn);
      expect(screen.getByTestId('dialog')).toBeDefined();
      expect(screen.getByTestId('dialog').dataset.open).toBe('true');
    });

    it('renders dialog title and description', () => {
      renderScreen();
      fireEvent.click(screen.getByLabelText('Add supplier'));
      expect(screen.getByTestId('dialog-title')).toBeDefined();
      expect(screen.getByTestId('dialog-description')).toBeDefined();
    });

    it('renders name input in dialog', () => {
      renderScreen();
      fireEvent.click(screen.getByLabelText('Add supplier'));
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });

    it('calls onAdd when add button in dialog is clicked with name', () => {
      const onAdd = vi.fn();
      renderScreen({ onAdd });
      fireEvent.click(screen.getByLabelText('Add supplier'));
      const dialogInput = screen
        .getAllByTestId('input')
        .find((el) => el.getAttribute('id') === 'supplier-name-input');
      if (!dialogInput) throw new Error('Dialog input not found');
      fireEvent.change(dialogInput, {
        target: { value: 'New Supplier' },
      });
      const addInDialog = screen
        .getAllByTestId('primary-button')
        .find((btn) => btn.textContent === 'Add');
      if (!addInDialog) throw new Error('Add button not found');
      fireEvent.click(addInDialog);
      expect(onAdd).toHaveBeenCalledWith('New Supplier');
    });

    it('does not call onAdd when name is empty', () => {
      const onAdd = vi.fn();
      renderScreen({ onAdd });
      fireEvent.click(screen.getByLabelText('Add supplier'));
      const addInDialog = screen
        .getAllByTestId('primary-button')
        .find((btn) => btn.textContent === 'Add');
      if (!addInDialog) throw new Error('Add button not found');
      fireEvent.click(addInDialog);
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('trims whitespace from name before calling onAdd', () => {
      const onAdd = vi.fn();
      renderScreen({ onAdd });
      fireEvent.click(screen.getByLabelText('Add supplier'));
      const dialogInput = screen
        .getAllByTestId('input')
        .find((el) => el.getAttribute('id') === 'supplier-name-input');
      if (!dialogInput) throw new Error('Dialog input not found');
      fireEvent.change(dialogInput, {
        target: { value: '  Spaced Supplier  ' },
      });
      const addInDialog = screen
        .getAllByTestId('primary-button')
        .find((btn) => btn.textContent === 'Add');
      if (!addInDialog) throw new Error('Add button not found');
      fireEvent.click(addInDialog);
      expect(onAdd).toHaveBeenCalledWith('Spaced Supplier');
    });

    it('closes dialog when cancel is clicked', () => {
      renderScreen();
      fireEvent.click(screen.getByLabelText('Add supplier'));
      expect(screen.getByTestId('dialog').dataset.open).toBe('true');
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.getByTestId('dialog').dataset.open).toBe('false');
    });
  });

  describe('delete action', () => {
    it('calls onDelete with correct id when delete button is clicked', () => {
      const onDelete = vi.fn();
      renderScreen({ onDelete });
      const deleteBtn = screen.getAllByLabelText('Delete supplier')[0];
      fireEvent.click(deleteBtn);
      expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('calls onDelete for the correct row', () => {
      const onDelete = vi.fn();
      renderScreen({ onDelete });
      const deleteBtns = screen.getAllByLabelText('Delete supplier');
      fireEvent.click(deleteBtns[1]);
      expect(onDelete).toHaveBeenCalledWith('2');
    });
  });

  describe('inline edit', () => {
    it('shows edit buttons for each row', () => {
      renderScreen();
      const editBtns = screen.getAllByLabelText('Edit supplier');
      expect(editBtns).toHaveLength(3);
    });

    it('shows inline input when edit is clicked', () => {
      renderScreen();
      const editBtns = screen.getAllByLabelText('Edit supplier');
      fireEvent.click(editBtns[0]);
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });

    it('shows save and cancel buttons when editing', () => {
      renderScreen();
      const editBtns = screen.getAllByLabelText('Edit supplier');
      fireEvent.click(editBtns[0]);
      expect(screen.getByLabelText('Save')).toBeDefined();
      expect(screen.getByLabelText('Cancel')).toBeDefined();
    });

    it('calls onEdit with updated values when save is clicked', async () => {
      const onEdit = vi.fn();
      renderScreen({ onEdit });
      const editBtns = screen.getAllByLabelText('Edit supplier');
      fireEvent.click(editBtns[0]);
      const editInput = screen.getAllByPlaceholderText('Supplier name');
      const nameInputInRow = editInput[editInput.length - 1];
      fireEvent.change(nameInputInRow, {
        target: { value: 'Updated Name' },
      });
      await waitFor(() => {
        expect((nameInputInRow as HTMLInputElement).value).toBe('Updated Name');
      });
      fireEvent.click(screen.getByLabelText('Save'));
      expect(onEdit).toHaveBeenCalledWith('1', 'Updated Name');
    });

    it('does not call onEdit when name is empty on save', () => {
      const onEdit = vi.fn();
      renderScreen({ onEdit });
      const editBtns = screen.getAllByLabelText('Edit supplier');
      fireEvent.click(editBtns[0]);
      const editInput = screen.getAllByPlaceholderText('Supplier name');
      const nameInputInRow = editInput[editInput.length - 1];
      fireEvent.change(nameInputInRow, {
        target: { value: '   ' },
      });
      fireEvent.click(screen.getByLabelText('Save'));
      expect(onEdit).not.toHaveBeenCalled();
    });

    it('cancels edit without calling onEdit', () => {
      const onEdit = vi.fn();
      renderScreen({ onEdit });
      const editBtns = screen.getAllByLabelText('Edit supplier');
      fireEvent.click(editBtns[0]);
      fireEvent.click(screen.getByLabelText('Cancel'));
      expect(onEdit).not.toHaveBeenCalled();
    });

    it('hides inline inputs after cancel', () => {
      renderScreen();
      const editBtns = screen.getAllByLabelText('Edit supplier');
      fireEvent.click(editBtns[0]);
      fireEvent.click(screen.getByLabelText('Cancel'));
      expect(screen.queryByLabelText('Save')).toBeNull();
      expect(screen.queryByLabelText('Cancel')).toBeNull();
    });

    it('hides inline inputs after save', () => {
      const onEdit = vi.fn();
      renderScreen({ onEdit });
      const editBtns = screen.getAllByLabelText('Edit supplier');
      fireEvent.click(editBtns[0]);
      fireEvent.click(screen.getByLabelText('Save'));
      expect(screen.queryByLabelText('Save')).toBeNull();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { TechnicianScreen } from '../TechnicianScreen.web';
import type {
  TechnicianScreenProps,
  TechnicianRow,
} from '../TechnicianScreen.types';

// ── Mocks ─────────────────────────────────────────────────────────────────────

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
      render?: (item: TechnicianRow) => React.ReactNode;
    }[];
    data: TechnicianRow[];
    emptyMessage?: string;
    getItemId: (item: TechnicianRow) => string;
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
  Popover: ({
    children,
  }: {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
  }) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({
    children,
  }: {
    children?: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({
    children,
  }: {
    children?: React.ReactNode;
    className?: string;
    align?: string;
  }) => <div data-testid="popover-content">{children}</div>,
  Calendar: ({
    onSelect,
  }: {
    mode?: string;
    selected?: Date;
    onSelect?: (d: Date) => void;
  }) => (
    <button
      data-testid="calendar"
      onClick={() => onSelect?.(new Date('2024-03-15'))}
    >
      Calendar
    </button>
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
        'technician.table.name': 'Name',
        'technician.table.entryDate': 'Entry Date',
        'technician.list.empty': 'No technicians registered yet',
        'technician.list.itemLabel': 'technicians',
        'technician.list.previous': 'Previous',
        'technician.list.next': 'Next',
        'technician.list.page': 'Page {{current}} of {{total}}',
        'technician.list.search': 'Search technicians...',
        'technician.list.add': 'Add technician',
        'technician.form.name': 'Name',
        'technician.form.entryDate': 'Entry Date',
        'technician.form.namePlaceholder': 'Technician name',
        'technician.form.datePlaceholder': 'Select date',
        'technician.form.add': 'Add',
        'technician.form.save': 'Save',
        'technician.form.cancel': 'Cancel',
        'technician.action.edit': 'Edit technician',
        'technician.action.delete': 'Delete technician',
        'technician.dialog.title': 'Add Technician',
        'technician.dialog.description':
          "Enter the technician's name and entry date to add them to the list.",
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

const mockTechnicians: TechnicianRow[] = [
  { id: '1', name: 'Alice Silva', entryDate: '2024-01-15' },
  { id: '2', name: 'Bob Santos', entryDate: '2024-02-20' },
  { id: '3', name: 'Carol Lima', entryDate: '2024-03-10' },
];

const defaultProps: TechnicianScreenProps = {
  technicians: mockTechnicians,
  onAdd: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

function renderScreen(props: Partial<TechnicianScreenProps> = {}) {
  return render(<TechnicianScreen {...defaultProps} {...props} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('TechnicianScreen (web)', () => {
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
      expect(screen.getAllByText('Entry Date').length).toBeGreaterThanOrEqual(
        1
      );
    });

    it('renders all technician rows', () => {
      renderScreen();
      expect(screen.getByTestId('row-1')).toBeDefined();
      expect(screen.getByTestId('row-2')).toBeDefined();
      expect(screen.getByTestId('row-3')).toBeDefined();
    });

    it('renders technician names', () => {
      renderScreen();
      expect(screen.getByText('Alice Silva')).toBeDefined();
      expect(screen.getByText('Bob Santos')).toBeDefined();
      expect(screen.getByText('Carol Lima')).toBeDefined();
    });

    it('renders formatted entry dates', () => {
      renderScreen();
      expect(screen.getByText('15/01/2024')).toBeDefined();
      expect(screen.getByText('20/02/2024')).toBeDefined();
    });

    it('renders empty message when no technicians', () => {
      renderScreen({ technicians: [] });
      expect(screen.getByText('No technicians registered yet')).toBeDefined();
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
    it('shows all technicians when search is empty', () => {
      renderScreen();
      expect(screen.getByTestId('row-1')).toBeDefined();
      expect(screen.getByTestId('row-2')).toBeDefined();
      expect(screen.getByTestId('row-3')).toBeDefined();
    });

    it('filters technicians by name', () => {
      renderScreen();
      const searchInput = screen.getAllByTestId('input')[0];
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      expect(screen.getByTestId('row-1')).toBeDefined();
      expect(screen.queryByTestId('row-2')).toBeNull();
      expect(screen.queryByTestId('row-3')).toBeNull();
    });

    it('is case-insensitive', () => {
      renderScreen();
      const searchInput = screen.getAllByTestId('input')[0];
      fireEvent.change(searchInput, { target: { value: 'alice' } });
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
      const addBtn = screen.getByLabelText('Add technician');
      fireEvent.click(addBtn);
      expect(screen.getByTestId('dialog')).toBeDefined();
      expect(screen.getByTestId('dialog').dataset.open).toBe('true');
    });

    it('renders dialog title and description', () => {
      renderScreen();
      fireEvent.click(screen.getByLabelText('Add technician'));
      expect(screen.getByTestId('dialog-title')).toBeDefined();
      expect(screen.getByTestId('dialog-description')).toBeDefined();
    });

    it('renders name input and date in dialog', () => {
      renderScreen();
      fireEvent.click(screen.getByLabelText('Add technician'));
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('shows default date as today', () => {
      renderScreen();
      fireEvent.click(screen.getByLabelText('Add technician'));
      const today = new Date();
      const formatted = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      expect(screen.getByText(formatted)).toBeDefined();
    });

    it('calls onAdd when add button in dialog is clicked', () => {
      const onAdd = vi.fn();
      renderScreen({ onAdd });
      fireEvent.click(screen.getByLabelText('Add technician'));
      const dialogInput = screen
        .getAllByTestId('input')
        .find((el) => el.getAttribute('id') === 'technician-name-input');
      if (!dialogInput) throw new Error('Dialog input not found');
      fireEvent.change(dialogInput, {
        target: { value: 'New Technician' },
      });
      const addInDialog = screen
        .getAllByTestId('primary-button')
        .find((btn) => btn.textContent === 'Add');
      if (!addInDialog) throw new Error('Add button not found');
      fireEvent.click(addInDialog);
      const today = new Date().toISOString().split('T')[0];
      expect(onAdd).toHaveBeenCalledWith('New Technician', today);
    });

    it('does not call onAdd when name is empty', () => {
      const onAdd = vi.fn();
      renderScreen({ onAdd });
      fireEvent.click(screen.getByLabelText('Add technician'));
      const addInDialog = screen
        .getAllByTestId('primary-button')
        .find((btn) => btn.textContent === 'Add');
      if (!addInDialog) throw new Error('Add button not found');
      fireEvent.click(addInDialog);
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('closes dialog when cancel is clicked', () => {
      renderScreen();
      fireEvent.click(screen.getByLabelText('Add technician'));
      expect(screen.getByTestId('dialog').dataset.open).toBe('true');
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.getByTestId('dialog').dataset.open).toBe('false');
    });
  });

  describe('delete action', () => {
    it('calls onDelete with correct id when delete button is clicked', () => {
      const onDelete = vi.fn();
      renderScreen({ onDelete });
      const deleteBtn = screen.getAllByLabelText('Delete technician')[0];
      fireEvent.click(deleteBtn);
      expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('calls onDelete for the correct row', () => {
      const onDelete = vi.fn();
      renderScreen({ onDelete });
      const deleteBtns = screen.getAllByLabelText('Delete technician');
      fireEvent.click(deleteBtns[1]);
      expect(onDelete).toHaveBeenCalledWith('2');
    });
  });

  describe('inline edit', () => {
    it('shows edit buttons for each row', () => {
      renderScreen();
      const editBtns = screen.getAllByLabelText('Edit technician');
      expect(editBtns).toHaveLength(3);
    });

    it('shows inline inputs when edit is clicked', () => {
      renderScreen();
      const editBtns = screen.getAllByLabelText('Edit technician');
      fireEvent.click(editBtns[0]);
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });

    it('shows save and cancel buttons when editing', () => {
      renderScreen();
      const editBtns = screen.getAllByLabelText('Edit technician');
      fireEvent.click(editBtns[0]);
      expect(screen.getByLabelText('Save')).toBeDefined();
      expect(screen.getByLabelText('Cancel')).toBeDefined();
    });

    it('calls onEdit with updated values when save is clicked', async () => {
      const onEdit = vi.fn();
      renderScreen({ onEdit });
      const editBtns = screen.getAllByLabelText('Edit technician');
      fireEvent.click(editBtns[0]);
      const editInput = screen.getAllByPlaceholderText('Technician name');
      const nameInputInRow = editInput[editInput.length - 1];
      fireEvent.change(nameInputInRow, {
        target: { value: 'Updated Name' },
      });
      await waitFor(() => {
        expect((nameInputInRow as HTMLInputElement).value).toBe('Updated Name');
      });
      fireEvent.click(screen.getByLabelText('Save'));
      expect(onEdit).toHaveBeenCalledWith('1', 'Updated Name', '2024-01-15');
    });

    it('cancels edit without calling onEdit', () => {
      const onEdit = vi.fn();
      renderScreen({ onEdit });
      const editBtns = screen.getAllByLabelText('Edit technician');
      fireEvent.click(editBtns[0]);
      fireEvent.click(screen.getByLabelText('Cancel'));
      expect(onEdit).not.toHaveBeenCalled();
    });

    it('hides inline inputs after cancel', () => {
      renderScreen();
      const editBtns = screen.getAllByLabelText('Edit technician');
      fireEvent.click(editBtns[0]);
      fireEvent.click(screen.getByLabelText('Cancel'));
      expect(screen.queryByLabelText('Save')).toBeNull();
      expect(screen.queryByLabelText('Cancel')).toBeNull();
    });

    it('hides inline inputs after save', () => {
      const onEdit = vi.fn();
      renderScreen({ onEdit });
      const editBtns = screen.getAllByLabelText('Edit technician');
      fireEvent.click(editBtns[0]);
      fireEvent.click(screen.getByLabelText('Save'));
      expect(screen.queryByLabelText('Save')).toBeNull();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      className={className}
      onKeyDown={onKeyDown}
      {...rest}
    />
  ),
  PrimaryButton: ({
    children,
    onClick,
    disabled,
    ...rest
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    'aria-label'?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant="primary"
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
  }) => (
    <div data-testid="table">
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
  }) => <div>{children}</div>,
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
        'technician.form.name': 'Name',
        'technician.form.entryDate': 'Entry Date',
        'technician.form.namePlaceholder': 'Technician name',
        'technician.form.datePlaceholder': 'Select date',
        'technician.form.add': 'Add',
        'technician.form.save': 'Save',
        'technician.form.cancel': 'Cancel',
        'technician.action.edit': 'Edit technician',
        'technician.action.delete': 'Delete technician',
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

// ── Fixtures ──────────────────────────────────────────────────────────────────

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
      // "Name" and "Entry Date" appear in both the form labels and table headers
      expect(screen.getAllByText('Name').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Entry Date').length).toBeGreaterThanOrEqual(
        2
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
  });

  describe('add form', () => {
    it('renders the name input', () => {
      renderScreen();
      expect(screen.getByPlaceholderText('Technician name')).toBeDefined();
    });

    it('renders the add button', () => {
      renderScreen();
      expect(screen.getByLabelText('Add')).toBeDefined();
    });

    it('add button is disabled when name is empty', () => {
      renderScreen();
      const addBtn = screen.getByLabelText('Add') as HTMLButtonElement;
      expect(addBtn.disabled).toBe(true);
    });

    it('add button is disabled when date is not selected', () => {
      renderScreen();
      const nameInput = screen.getByPlaceholderText('Technician name');
      fireEvent.change(nameInput, { target: { value: 'New Tech' } });
      const addBtn = screen.getByLabelText('Add') as HTMLButtonElement;
      expect(addBtn.disabled).toBe(true);
    });

    it('calls onAdd with name and date when add button is clicked', () => {
      const onAdd = vi.fn();
      renderScreen({ onAdd });
      fireEvent.change(screen.getByPlaceholderText('Technician name'), {
        target: { value: 'New Technician' },
      });
      // Select a date via the Calendar mock
      const calendars = screen.getAllByTestId('calendar');
      fireEvent.click(calendars[0]);
      fireEvent.click(screen.getByLabelText('Add'));
      expect(onAdd).toHaveBeenCalledWith('New Technician', '2024-03-15');
    });

    it('clears the form after adding', () => {
      const onAdd = vi.fn();
      renderScreen({ onAdd });
      const nameInput = screen.getByPlaceholderText('Technician name');
      fireEvent.change(nameInput, { target: { value: 'New Technician' } });
      const calendars = screen.getAllByTestId('calendar');
      fireEvent.click(calendars[0]);
      fireEvent.click(screen.getByLabelText('Add'));
      expect((nameInput as HTMLInputElement).value).toBe('');
    });

    it('calls onAdd when Enter is pressed in name input after date is selected', () => {
      const onAdd = vi.fn();
      renderScreen({ onAdd });
      const nameInput = screen.getByPlaceholderText('Technician name');
      fireEvent.change(nameInput, { target: { value: 'Enter Tech' } });
      const calendars = screen.getAllByTestId('calendar');
      fireEvent.click(calendars[0]);
      fireEvent.keyDown(nameInput, { key: 'Enter' });
      expect(onAdd).toHaveBeenCalledWith('Enter Tech', '2024-03-15');
    });

    it('does not call onAdd when Enter is pressed without a date', () => {
      const onAdd = vi.fn();
      renderScreen({ onAdd });
      const nameInput = screen.getByPlaceholderText('Technician name');
      fireEvent.change(nameInput, { target: { value: 'Enter Tech' } });
      fireEvent.keyDown(nameInput, { key: 'Enter' });
      expect(onAdd).not.toHaveBeenCalled();
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
      // Name input should appear in the row
      const nameInputs = screen.getAllByPlaceholderText('Technician name');
      expect(nameInputs.length).toBeGreaterThanOrEqual(1);
    });

    it('shows save and cancel buttons when editing', () => {
      renderScreen();
      const editBtns = screen.getAllByLabelText('Edit technician');
      fireEvent.click(editBtns[0]);
      expect(screen.getByLabelText('Save')).toBeDefined();
      expect(screen.getByLabelText('Cancel')).toBeDefined();
    });

    it('calls onEdit with updated values when save is clicked', () => {
      const onEdit = vi.fn();
      renderScreen({ onEdit });
      const editBtns = screen.getAllByLabelText('Edit technician');
      fireEvent.click(editBtns[0]);
      // Change the name
      const editInputs = screen.getAllByPlaceholderText('Technician name');
      fireEvent.change(editInputs[editInputs.length - 1], {
        target: { value: 'Updated Name' },
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

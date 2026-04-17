import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Table, type TableColumn } from '../Table.web';

interface TestRow {
  id: string;
  name: string;
  age: number;
}

const testColumns: TableColumn<TestRow>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age', sortable: true },
];

const testData: TestRow[] = [
  { id: '1', name: 'Charlie', age: 30 },
  { id: '2', name: 'Alice', age: 25 },
  { id: '3', name: 'Bob', age: 35 },
];

function renderTable(
  props: Partial<Parameters<typeof Table<TestRow>>[0]> = {}
) {
  return render(
    <Table<TestRow>
      columns={testColumns}
      data={testData}
      getItemId={(item) => item.id}
      {...props}
    />
  );
}

describe('Table (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders column headers', () => {
      renderTable();
      expect(screen.getByText('Name')).toBeDefined();
      expect(screen.getByText('Age')).toBeDefined();
    });

    it('renders row data', () => {
      renderTable();
      expect(screen.getByText('Charlie')).toBeDefined();
      expect(screen.getByText('Alice')).toBeDefined();
      expect(screen.getByText('Bob')).toBeDefined();
    });

    it('renders empty message when data is empty', () => {
      renderTable({ data: [], emptyMessage: 'Nothing here' });
      expect(screen.getByText('Nothing here')).toBeDefined();
    });

    it('renders default empty message', () => {
      renderTable({ data: [] });
      expect(screen.getByText('No data')).toBeDefined();
    });
  });

  describe('sorting — column header interaction', () => {
    it('renders sortable headers as clickable buttons', () => {
      renderTable();
      const nameHeader = screen.getByRole('button', { name: /Name/ });
      expect(nameHeader).toBeDefined();
      expect(nameHeader.getAttribute('aria-sort')).toBe('none');
    });

    it('does not render non-sortable headers as buttons', () => {
      const cols: TableColumn<TestRow>[] = [
        { key: 'name', header: 'Name', sortable: false },
        { key: 'age', header: 'Age', sortable: true },
      ];
      renderTable({ columns: cols });
      // Name should not be a button
      const buttons = screen.getAllByRole('button');
      const nameButton = buttons.find((btn) =>
        btn.textContent?.includes('Name')
      );
      expect(nameButton).toBeUndefined();
    });

    it('first click sorts ascending (aria-sort="ascending")', () => {
      renderTable();
      const nameHeader = screen.getByRole('button', { name: /Name/ });
      fireEvent.click(nameHeader);
      expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
    });

    it('second click on same header sorts descending', () => {
      renderTable();
      const nameHeader = screen.getByRole('button', { name: /Name/ });
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);
      expect(nameHeader.getAttribute('aria-sort')).toBe('descending');
    });

    it('third click on same header clears sort (aria-sort="none")', () => {
      renderTable();
      const nameHeader = screen.getByRole('button', { name: /Name/ });
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);
      expect(nameHeader.getAttribute('aria-sort')).toBe('none');
    });

    it('sorts data ascending by name on first click', () => {
      const { container } = renderTable();
      const nameHeader = screen.getByRole('button', { name: /Name/ });
      fireEvent.click(nameHeader);

      // Get row text content in order (skip header row)
      const rows = container.querySelectorAll(
        '[class*="border-b"][class*="flex"]:not([class*="font-medium"])'
      );
      const names = Array.from(rows)
        .map((row) => {
          const cells = row.querySelectorAll('[class*="min-w-0"]');
          return cells[0]?.textContent?.trim();
        })
        .filter(Boolean);

      expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('sorts data descending by name on second click', () => {
      const { container } = renderTable();
      const nameHeader = screen.getByRole('button', { name: /Name/ });
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);

      const rows = container.querySelectorAll(
        '[class*="border-b"][class*="flex"]:not([class*="font-medium"])'
      );
      const names = Array.from(rows)
        .map((row) => {
          const cells = row.querySelectorAll('[class*="min-w-0"]');
          return cells[0]?.textContent?.trim();
        })
        .filter(Boolean);

      expect(names).toEqual(['Charlie', 'Bob', 'Alice']);
    });

    it('restores original order on third click', () => {
      const { container } = renderTable();
      const nameHeader = screen.getByRole('button', { name: /Name/ });
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);

      const rows = container.querySelectorAll(
        '[class*="border-b"][class*="flex"]:not([class*="font-medium"])'
      );
      const names = Array.from(rows)
        .map((row) => {
          const cells = row.querySelectorAll('[class*="min-w-0"]');
          return cells[0]?.textContent?.trim();
        })
        .filter(Boolean);

      // Original order: Charlie, Alice, Bob
      expect(names).toEqual(['Charlie', 'Alice', 'Bob']);
    });

    it('clicking a different header deactivates the previous sort', () => {
      renderTable();
      const nameHeader = screen.getByRole('button', { name: /Name/ });
      const ageHeader = screen.getByRole('button', { name: /Age/ });

      // Sort by Name first
      fireEvent.click(nameHeader);
      expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
      expect(ageHeader.getAttribute('aria-sort')).toBe('none');

      // Now sort by Age
      fireEvent.click(ageHeader);
      expect(ageHeader.getAttribute('aria-sort')).toBe('ascending');
      expect(nameHeader.getAttribute('aria-sort')).toBe('none');
    });

    it('uses custom sortFn when provided', () => {
      const cols: TableColumn<TestRow>[] = [
        {
          key: 'name',
          header: 'Name',
          sortable: true,
          sortFn: (a, b) => a.name.length - b.name.length,
        },
        { key: 'age', header: 'Age', sortable: true },
      ];
      const { container } = renderTable({ columns: cols });
      const nameHeader = screen.getByRole('button', { name: /Name/ });
      fireEvent.click(nameHeader);

      const rows = container.querySelectorAll(
        '[class*="border-b"][class*="flex"]:not([class*="font-medium"])'
      );
      const names = Array.from(rows)
        .map((row) => {
          const cells = row.querySelectorAll('[class*="min-w-0"]');
          return cells[0]?.textContent?.trim();
        })
        .filter(Boolean);

      // Sorted by name length ascending: Bob(3), Alice(5), Charlie(7)
      expect(names).toEqual(['Bob', 'Alice', 'Charlie']);
    });

    it('supports keyboard activation with Enter key', () => {
      renderTable();
      const nameHeader = screen.getByRole('button', { name: /Name/ });
      fireEvent.keyDown(nameHeader, { key: 'Enter' });
      expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
    });

    it('supports keyboard activation with Space key', () => {
      renderTable();
      const nameHeader = screen.getByRole('button', { name: /Name/ });
      fireEvent.keyDown(nameHeader, { key: ' ' });
      expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
    });
  });

  describe('toolbar', () => {
    it('renders toolbarLeft content', () => {
      renderTable({ toolbarLeft: <input placeholder="Search..." /> });
      expect(screen.getByPlaceholderText('Search...')).toBeDefined();
    });

    it('renders toolbarRight content', () => {
      renderTable({ toolbarRight: <button type="button">Add</button> });
      expect(screen.getByRole('button', { name: 'Add' })).toBeDefined();
    });

    it('renders both toolbarLeft and toolbarRight', () => {
      renderTable({
        toolbarLeft: <input placeholder="Search..." />,
        toolbarRight: <button type="button">Add</button>,
      });
      expect(screen.getByPlaceholderText('Search...')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Add' })).toBeDefined();
    });
  });

  describe('prependRow', () => {
    it('renders prependRow content above body rows', () => {
      renderTable({
        prependRow: <div data-testid="prepend">custom row</div>,
      });
      expect(screen.getByTestId('prepend')).toBeDefined();
      expect(screen.getByText('custom row')).toBeDefined();
    });

    it('does not render prependRow slot when prop is omitted', () => {
      renderTable();
      expect(screen.queryByTestId('prepend')).toBeNull();
    });
  });

  describe('selection', () => {
    it('renders checkboxes when selectable is true', () => {
      renderTable({ selectable: true });
      const checkboxes = screen.getAllByRole('checkbox');
      // 1 select-all + 3 rows
      expect(checkboxes.length).toBe(4);
    });

    it('hides checkboxes when selectable is false', () => {
      renderTable({ selectable: false });
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBe(0);
    });

    it('calls onRowSelect when a row checkbox is toggled', () => {
      const onRowSelect = vi.fn();
      renderTable({ onRowSelect });
      const checkboxes = screen.getAllByRole('checkbox');
      // Click on first row checkbox (index 1 since 0 is select-all)
      const firstRowCheckbox = checkboxes[1];
      if (firstRowCheckbox) fireEvent.click(firstRowCheckbox);
      expect(onRowSelect).toHaveBeenCalledWith('1');
    });
  });

  describe('row click', () => {
    it('calls onRowClick when a row is clicked', () => {
      const onRowClick = vi.fn();
      renderTable({ onRowClick });
      fireEvent.click(screen.getByText('Alice'));
      expect(onRowClick).toHaveBeenCalledWith(testData[1]);
    });
  });

  describe('pagination', () => {
    it('shows pagination when data exceeds itemsPerPage', () => {
      renderTable({ itemsPerPage: 2 });
      expect(screen.getByRole('button', { name: 'Next' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Previous' })).toBeDefined();
    });

    it('does not show pagination when all data fits', () => {
      renderTable({ itemsPerPage: 10 });
      expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
    });

    it('resets to page 1 when sort changes', () => {
      renderTable({ itemsPerPage: 2 });
      // Go to page 2
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      // Sort by Name — should reset to page 1
      const nameHeader = screen.getByRole('button', { name: /Name/ });
      fireEvent.click(nameHeader);
      // Should see first 2 items of sorted data
      expect(screen.getByText('Alice')).toBeDefined();
    });
  });
});

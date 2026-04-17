'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { cn } from '../../utils';

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

export interface TableColumn<T> {
  /** Unique key identifying this column */
  key: string;
  /** Column header label */
  header: string;
  /** Flex proportion for this column (default 1). Higher = wider. */
  flex?: number;
  /** Minimum width in px (default 100) */
  minWidth?: number;
  /** Custom cell renderer — receives the row item */
  render?: (item: T) => React.ReactNode;
  /** Whether this column is sortable (default false) */
  sortable?: boolean;
  /** Custom sort comparator. Return negative / 0 / positive. */
  sortFn?: (a: T, b: T) => number;
}

export interface TableProps<T> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Row data */
  data: T[];
  /** Extracts a unique string id from each row */
  getItemId: (item: T) => string;
  /** Items per page (default 10) */
  itemsPerPage?: number;
  /** Called when a row checkbox is toggled */
  onRowSelect?: (id: string) => void;
  /** Called when row is clicked */
  onRowClick?: (item: T) => void;
  /** Optional class on the root wrapper */
  className?: string;
  /** Message shown when data is empty */
  emptyMessage?: string;
  /** Enable row selection checkboxes (default true) */
  selectable?: boolean;
  /** Enable export menus (default false) */
  exportable?: boolean;
  /** CSV export handler — if provided, "CSV" option appears */
  onExportCSV?: (data: T[]) => void;
  /** JSON export handler — if provided, "JSON" option appears */
  onExportJSON?: (data: T[]) => void;
  /** Pagination label builder e.g. "10 clients" */
  itemLabel?: string;
  /** Previous button label */
  previousLabel?: string;
  /** Next button label */
  nextLabel?: string;
  /** Page label builder — receives current, total */
  pageLabel?: (current: number, total: number) => string;
  /** Sort button label */
  sortLabel?: string;
  /** Export button label */
  exportLabel?: string;
  /** Content rendered on the left side of the toolbar (e.g. search input) */
  toolbarLeft?: React.ReactNode;
  /** Content rendered on the right side of the toolbar (e.g. action buttons) */
  toolbarRight?: React.ReactNode;
  /** Optional row rendered above body rows (e.g. inline edit row) */
  prependRow?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Table<T>({
  columns,
  data,
  getItemId,
  itemsPerPage = 10,
  onRowSelect,
  onRowClick,
  className,
  emptyMessage = 'No data',
  selectable = true,
  exportable = false,
  onExportCSV,
  onExportJSON,
  itemLabel = 'items',
  previousLabel = 'Previous',
  nextLabel = 'Next',
  pageLabel,
  sortLabel: _sortLabel = 'Sort',
  exportLabel = 'Export',
  toolbarLeft,
  toolbarRight,
  prependRow,
}: TableProps<T>): React.JSX.Element {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  /* ---------- sorting ---------- */

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        if (sortOrder === 'asc') {
          setSortOrder('desc');
        } else {
          setSortKey(null);
          setSortOrder('asc');
        }
      } else {
        setSortKey(key);
        setSortOrder('asc');
      }
      setCurrentPage(1);
    },
    [sortKey, sortOrder]
  );

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;

    return [...data].sort((a, b) => {
      if (col.sortFn) {
        const result = col.sortFn(a, b);
        return sortOrder === 'asc' ? result : -result;
      }
      // Fallback: compare by key as string
      const aVal = String((a as Record<string, unknown>)[col.key] ?? '');
      const bVal = String((b as Record<string, unknown>)[col.key] ?? '');
      const cmp = aVal.localeCompare(bVal);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [data, columns, sortKey, sortOrder]);

  /* ---------- pagination ---------- */

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  /* ---------- selection ---------- */

  const handleToggle = useCallback(
    (id: string) => {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
      onRowSelect?.(id);
    },
    [onRowSelect]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map(getItemId));
    }
  }, [selectedIds.length, paginatedData, getItemId]);

  /* ---------- render helpers ---------- */

  const defaultPageLabel = (current: number, total: number) =>
    `Page ${current} of ${total}`;

  const pageLabelFn = pageLabel ?? defaultPageLabel;

  const colStyle = (col: TableColumn<T>): React.CSSProperties => ({
    flex: col.flex ?? 1,
    minWidth: col.minWidth ?? 100,
  });

  /* ---------- JSX ---------- */

  return (
    <div className={cn('w-full', className)}>
      {/* Toolbar */}
      {(exportable || toolbarLeft || toolbarRight) && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Export dropdown */}
            {exportable && (onExportCSV || onExportJSON) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExportMenu((p) => !p)}
                  className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md"
                >
                  <Download size={14} />
                  {exportLabel}
                  <ChevronDown size={14} className="opacity-50" />
                </button>

                {showExportMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="absolute right-0 mt-1 w-32 bg-background border border-border/50 shadow-lg rounded-md z-20">
                      {onExportCSV && (
                        <button
                          type="button"
                          onClick={() => {
                            onExportCSV(sortedData);
                            setShowExportMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                        >
                          CSV
                        </button>
                      )}
                      {onExportJSON && (
                        <button
                          type="button"
                          onClick={() => {
                            onExportJSON(sortedData);
                            setShowExportMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors border-t border-border/30"
                        >
                          JSON
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {toolbarLeft && <div className="flex-1 min-w-0">{toolbarLeft}</div>}
          {toolbarRight}
        </div>
      )}

      {/* Table */}
      <div className="bg-background border border-border/50 overflow-hidden rounded-lg">
        {/* Header row */}
        <div className="flex py-3 text-xs font-medium text-muted-foreground/60 bg-muted/5 border-b border-border">
          {selectable && (
            <div className="flex items-center justify-center border-r border-border w-12 shrink-0">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border/40 cursor-pointer accent-muted-foreground"
                checked={
                  paginatedData.length > 0 &&
                  selectedIds.length === paginatedData.length
                }
                onChange={handleSelectAll}
                aria-label="Select all"
              />
            </div>
          )}
          {columns.map((col, idx) => (
            <div
              key={col.key}
              className={cn(
                'flex items-center gap-1.5 px-3 min-w-0',
                idx < columns.length - 1 && 'border-r border-border',
                col.sortable &&
                  'cursor-pointer select-none hover:text-muted-foreground transition-colors'
              )}
              style={colStyle(col)}
              onClick={col.sortable ? () => handleSort(col.key) : undefined}
              role={col.sortable ? 'button' : undefined}
              tabIndex={col.sortable ? 0 : undefined}
              onKeyDown={
                col.sortable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSort(col.key);
                      }
                    }
                  : undefined
              }
              aria-sort={
                col.sortable
                  ? sortKey === col.key
                    ? sortOrder === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                  : undefined
              }
            >
              <span className="truncate">{col.header}</span>
              {col.sortable &&
                sortKey === col.key &&
                (sortOrder === 'asc' ? (
                  <ChevronUp size={12} className="shrink-0 opacity-80" />
                ) : (
                  <ChevronDown size={12} className="shrink-0 opacity-80" />
                ))}
            </div>
          ))}
        </div>

        {/* Optional prepend row (e.g. inline edit row) */}
        {prependRow && (
          <div className="flex bg-muted/5 border-b border-border">
            {selectable && (
              <div className="w-12 shrink-0 border-r border-border" />
            )}
            {prependRow}
          </div>
        )}

        {/* Body rows */}
        {paginatedData.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground/60">
            {emptyMessage}
          </div>
        ) : (
          paginatedData.map((item) => {
            const id = getItemId(item);
            const isSelected = selectedIds.includes(id);

            return (
              <div
                key={id}
                className={cn(
                  'py-3.5 transition-all duration-150 border-b border-border flex',
                  isSelected ? 'bg-muted/30' : 'bg-muted/5 hover:bg-muted/20',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {selectable && (
                  <div className="flex items-center justify-center border-r border-border w-12 shrink-0">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border/40 cursor-pointer accent-muted-foreground"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggle(id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select row ${id}`}
                    />
                  </div>
                )}
                {columns.map((col, idx) => (
                  <div
                    key={col.key}
                    className={cn(
                      'flex items-center min-w-0 px-3',
                      idx < columns.length - 1 && 'border-r border-border'
                    )}
                    style={colStyle(col)}
                  >
                    {col.render ? (
                      col.render(item)
                    ) : (
                      <span className="text-sm text-foreground/80 truncate">
                        {String(
                          (item as Record<string, unknown>)[col.key] ?? ''
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-xs text-muted-foreground/70">
            {pageLabelFn(currentPage, totalPages)} &bull; {sortedData.length}{' '}
            {itemLabel}
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md"
            >
              {previousLabel}
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md"
            >
              {nextLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

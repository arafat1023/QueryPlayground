import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Copy } from 'lucide-react';
import { copyToClipboard } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface TableViewProps {
  rows: unknown[];
  onRowClick?: (row: Record<string, unknown>) => void;
}

type ResultRow = Record<string, unknown>;

/**
 * TableView component using TanStack Table v8
 * Features: sorting, pagination, copy cell/row, export
 */
export function TableView({ rows, onRowClick }: TableViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Generate columns dynamically from first row
  const columns = useMemo(() => {
    if (rows.length === 0) return [];
    const columnHelper = createColumnHelper<ResultRow>();
    const keys = Object.keys(rows[0] as ResultRow);

    return keys.map((key) =>
      columnHelper.accessor(key, {
        id: key,
        header: key,
        cell: (info) => formatCellValue(info.getValue()),
      })
    ) as ColumnDef<ResultRow, unknown>[];
  }, [rows]);

  // Table instance with sorting and pagination
  const table = useReactTable({
    data: rows as ResultRow[],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  const handleCopyCell = async (value: string, columnName: string) => {
    const success = await copyToClipboard(value);
    if (success) {
      toast.success(`Copied "${columnName}" to clipboard`);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleCopyRow = async (row: ResultRow) => {
    const json = JSON.stringify(row, null, 2);
    const success = await copyToClipboard(json);
    if (success) {
      toast.success('Copied row to clipboard');
    } else {
      toast.error('Failed to copy row');
    }
  };

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <p className="text-sm">Query executed successfully. No rows returned.</p>
      </div>
    );
  }

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = rows.length;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min(startRow + pageSize - 1, totalRows);

  return (
    <div className="flex flex-col h-full">
      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="whitespace-nowrap">
            Rows {startRow}-{endRow} of {totalRows}
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300"
            aria-label="Rows per page"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 text-xs text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="First page"
          >
            <span className="hidden sm:inline">First</span>
            <span className="sm:hidden">«</span>
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 text-xs text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Previous page"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">‹</span>
          </button>
          <span className="px-2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {pageIndex + 1}/{table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 text-xs text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">›</span>
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 text-xs text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Last page"
          >
            <span className="hidden sm:inline">Last</span>
            <span className="sm:hidden">»</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="flex items-center">
                        {header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-400" />
                        )}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2 w-10 text-center border-b border-gray-200 dark:border-gray-700">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 text-gray-700 dark:text-gray-300 font-mono text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCell(formatCellValue(cell.getValue()), cell.column.id);
                    }}
                  >
                    <span className="block truncate hover:bg-gray-100 dark:hover:bg-gray-700 px-1 rounded">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </td>
                ))}
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyRow(row.original);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Copy row"
                    aria-label="Copy row as JSON"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Format cell value for display
 */
function formatCellValue(value: unknown): string {
  if (value === null) return 'NULL';
  if (value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'bigint') return value.toString();
  return String(value);
}

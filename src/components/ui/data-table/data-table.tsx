import * as React from 'react';

import { cn } from '@/utils/cn';

export type TableColumn<T> = {
  key: string;
  label: string;
  className?: string;
  render: (item: T) => React.ReactNode;
};

export type DataTableProps<T> = {
  columns: TableColumn<T>[];
  items: T[];
  getRowKey: (item: T) => string;
  empty: string;
  onRowClick?: (item: T) => void;
};

export const DataTable = <T,>({
  columns,
  items,
  getRowKey,
  empty,
  onRowClick,
}: DataTableProps<T>) => {
  return (
    <div className="overflow-hidden rounded-xl border border-[#EADBCD] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EADBCD] bg-[#FFFDF9]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-5 py-3 text-left text-xs font-semibold text-muted-foreground',
                    column.className,
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EADBCD]">
            {items.map((item) => (
              <tr
                key={getRowKey(item)}
                className={cn(
                  'transition hover:bg-[#FFFDF9]',
                  onRowClick && 'cursor-pointer',
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-5 py-4 align-middle', column.className)}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td
                  className="px-5 py-10 text-sm text-muted-foreground"
                  colSpan={columns.length}
                >
                  {empty}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};

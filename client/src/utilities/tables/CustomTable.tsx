import React from 'react';
import type { CustomTableProps } from '../../types/tableType';

function CustomTable<T = any>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
  caption,
  className = '',
  containerClassName = '',
}: CustomTableProps<T>): React.ReactElement {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs ${containerClassName}`}
    >
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-slate-200 text-left text-sm ${className}`}>
          {caption && (
            <caption className="bg-slate-50 px-4 py-2 text-left text-xs font-semibold text-slate-500">
              {caption}
            </caption>
          )}
          <thead className="bg-slate-50/90 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={String(col.key || index)}
                  scope="col"
                  className={`px-4 py-3.5 whitespace-nowrap ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="mb-2 h-8 w-8 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const rowKey = keyExtractor ? keyExtractor(row, rowIndex) : rowIndex;
                return (
                  <tr
                    key={rowKey}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    {columns.map((col, colIndex) => {
                      const cellKey = String(col.key || colIndex);
                      let cellContent: React.ReactNode = null;

                      if (col.render) {
                        cellContent = col.render(row, rowIndex);
                      } else if (col.key) {
                        const val = (row as any)[col.key];
                        cellContent = val !== null && val !== undefined ? String(val) : '-';
                      }

                      return (
                        <td
                          key={cellKey}
                          className={`px-4 py-3.5 text-slate-700 whitespace-nowrap ${col.className || ''}`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomTable;

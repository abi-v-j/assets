import React from 'react';
import type { CustomTableProps } from '../../types/tableType';

function CustomTable<T = any>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
  caption,
  border = 1,
  cellPadding = 8,
  cellSpacing,
}: CustomTableProps<T>): React.ReactElement {
  return (
    <table border={border} cellPadding={cellPadding} cellSpacing={cellSpacing}>
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={String(col.key || index)}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} align="center">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, rowIndex) => {
            const rowKey = keyExtractor ? keyExtractor(row, rowIndex) : rowIndex;
            return (
              <tr key={rowKey}>
                {columns.map((col, colIndex) => {
                  const cellKey = String(col.key || colIndex);
                  let cellContent: React.ReactNode = null;

                  if (col.render) {
                    cellContent = col.render(row, rowIndex);
                  } else if (col.key) {
                    const val = (row as any)[col.key];
                    cellContent = val !== null && val !== undefined ? String(val) : '-';
                  }

                  return <td key={cellKey}>{cellContent}</td>;
                })}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

export default CustomTable;

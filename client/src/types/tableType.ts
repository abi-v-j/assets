import React from 'react';

export interface ColumnDefinition<T = any> {
  header: React.ReactNode;
  key?: keyof T | string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface CustomTableProps<T = any> {
  columns: ColumnDefinition<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string | number;
  emptyMessage?: string;
  caption?: string;
  border?: number;
  cellPadding?: number;
  cellSpacing?: number;
}

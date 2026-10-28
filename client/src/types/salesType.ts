import type { Customer } from './customerType';
import type { Item } from './itemType';

export interface SalesDetailItem {
  sales_detail_id?: number;
  line_no?: number;
  item_id: number;
  quantity: number;
  unit_price: number | string;
  line_amount?: number | string;
  item_details?: Partial<Item>;
}

export interface SalesOrder {
  sales_id: number;
  sales_no: string;
  sales_date: string;
  total_amount: string | number;
  status: 'DRAFT' | 'CONFIRMED' | 'INVOICED' | 'CANCELLED';
  remarks?: string;
  created_at: string;
  customer_details?: Customer;
  lines?: SalesDetailItem[];
  has_invoice?: boolean;
  invoice_no?: string;
}

export interface SalesLinePayload {
  item_id: number;
  quantity: number;
  unit_price?: number;
}

export interface CreateSalesOrderPayload {
  sales_no: string;
  sales_date?: string;
  customer_id: number;
  status?: string;
  remarks?: string;
  lines: SalesLinePayload[];
}

export interface LineItemFormState {
  item_id: number;
  quantity: number;
  unit_price: number;
}

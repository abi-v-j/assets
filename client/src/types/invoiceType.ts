export interface Invoice {
  invoice_id: number;
  invoice_no: string;
  invoice_date: string;
  sales_id: number;
  sub_total: string | number;
  tax_amount: string | number;
  net_amount: string | number;
  payment_status: 'UNPAID' | 'PARTIAL' | 'PAID';
  created_at: string;
  sales_no?: string;
  sales_date?: string;
  customer_name?: string;
  customer_code?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface CreateInvoicePayload {
  sales_id: number;
  invoice_no: string;
  invoice_date?: string;
  tax_rate?: number;
  payment_status?: string;
}

export interface UpdatePaymentStatusPayload {
  payment_status: string;
}

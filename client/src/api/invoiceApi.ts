import { api } from './axiosClient';
import type { ApiResponse, Invoice } from '../types';

export const getInvoices = async (): Promise<Invoice[]> => {
  const res = await api.get<ApiResponse<Invoice[]>>('/invoice/all/');
  return res.data.data || [];
};

export const getInvoiceById = async (id: number): Promise<Invoice> => {
  const res = await api.get<ApiResponse<Invoice>>(`/invoice/${id}/`);
  return res.data.data;
};

export interface CreateInvoicePayload {
  sales_id: number;
  invoice_no: string;
  invoice_date?: string;
  tax_rate?: number;
  payment_status?: string;
}

export const createInvoice = async (payload: CreateInvoicePayload): Promise<Invoice> => {
  const res = await api.post<ApiResponse<Invoice>>('/invoice/create/', payload);
  return res.data.data;
};

export const updateInvoicePaymentStatus = async (id: number, payment_status: string): Promise<void> => {
  await api.post<ApiResponse<any>>(`/invoice/${id}/payment-status/`, { payment_status });
};

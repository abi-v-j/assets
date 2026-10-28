import { api } from './axiosClient';
import type { ApiResponse, SalesOrder } from '../types';

export const getSalesOrders = async (): Promise<SalesOrder[]> => {
  const res = await api.get<ApiResponse<SalesOrder[]>>('/sales/all/');
  return res.data.data || [];
};

export const getSalesOrderById = async (id: number): Promise<SalesOrder> => {
  const res = await api.get<ApiResponse<SalesOrder>>(`/sales/${id}/`);
  return res.data.data;
};

export interface CreateSalesOrderPayload {
  sales_no: string;
  sales_date?: string;
  customer_id: number;
  status?: string;
  remarks?: string;
  lines: {
    item_id: number;
    quantity: number;
    unit_price?: number;
  }[];
}

export const createSalesOrder = async (payload: CreateSalesOrderPayload): Promise<SalesOrder> => {
  const res = await api.post<ApiResponse<SalesOrder>>('/sales/create/', payload);
  return res.data.data;
};

export const updateSalesStatus = async (id: number, status: string): Promise<void> => {
  await api.post<ApiResponse<any>>(`/sales/${id}/status/`, { status });
};

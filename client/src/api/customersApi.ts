import { api } from './axiosClient';
import type { ApiResponse, Customer } from '../types';

export const getCustomers = async (): Promise<Customer[]> => {
  const res = await api.get<ApiResponse<Customer[]>>('/common/customers/all/');
  return res.data.data || [];
};

export const getCustomerById = async (id: number): Promise<Customer> => {
  const res = await api.get<ApiResponse<Customer>>(`/common/customers/${id}/detail/`);
  return res.data.data;
};

export const createCustomer = async (customer: Partial<Customer>): Promise<Customer> => {
  const res = await api.post<ApiResponse<Customer>>('/common/customers/create/', customer);
  return res.data.data;
};

export const updateCustomer = async (id: number, customer: Partial<Customer>): Promise<Customer> => {
  const res = await api.put<ApiResponse<Customer>>(`/common/customers/${id}/update/`, customer);
  return res.data.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await api.delete<ApiResponse<any>>(`/common/customers/${id}/delete/`);
};

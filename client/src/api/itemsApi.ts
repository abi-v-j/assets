import { api } from './axiosClient';
import type { ApiResponse, Item } from '../types';

export const getItems = async (): Promise<Item[]> => {
  const res = await api.get<ApiResponse<Item[]>>('/common/items/all/');
  return res.data.data || [];
};

export const getItemById = async (id: number): Promise<Item> => {
  const res = await api.get<ApiResponse<Item>>(`/common/items/${id}/detail/`);
  return res.data.data;
};

export const createItem = async (item: Partial<Item>): Promise<Item> => {
  const res = await api.post<ApiResponse<Item>>('/common/items/create/', item);
  return res.data.data;
};

export const updateItem = async (id: number, item: Partial<Item>): Promise<Item> => {
  const res = await api.put<ApiResponse<Item>>(`/common/items/${id}/update/`, item);
  return res.data.data;
};

export const deleteItem = async (id: number): Promise<void> => {
  await api.delete<ApiResponse<any>>(`/common/items/${id}/delete/`);
};

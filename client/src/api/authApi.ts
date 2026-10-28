import { api } from './axiosClient';
import type { ApiResponse, AuthResponseData, AdminUser } from '../types';

export const loginAdmin = async (credentials: { email: string; password: string }): Promise<AuthResponseData> => {
  const res = await api.post<ApiResponse<AuthResponseData>>('/auth/login/', credentials);
  const data = res.data.data;
  localStorage.setItem('access_token', data.tokens.access_token);
  localStorage.setItem('refresh_token', data.tokens.refresh_token);
  localStorage.setItem('user_info', JSON.stringify(data.user));
  return data;
};

export const getAdminProfile = async (): Promise<AdminUser> => {
  const res = await api.get<ApiResponse<AdminUser>>('/auth/profile/');
  return res.data.data;
};

export const logoutAdmin = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_info');
};

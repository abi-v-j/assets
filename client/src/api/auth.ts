import type { ApiResponse, LoginCredentials , } from "../types/authType";
import { api } from "./axiosClient";

export const authenticateUser = async (credentials: LoginCredentials): Promise<ApiResponse<{ user_id: number }>> => {
  const res = await api.post<ApiResponse<{ user_id: number }>>('/auth/login/', credentials);
  return res.data;
};
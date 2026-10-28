export interface CustomButtonProps {
  name: string;
  onClick: () => void;
}
export interface ApiResponse<T = any> {
  status: string;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
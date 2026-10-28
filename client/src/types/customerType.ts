export interface Customer {
  customer_id: number;
  customer_code: string;
  customer_name: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CreateCustomerPayload {
  customer_code: string;
  customer_name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerPayload {
  customer_code: string;
  customer_name: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
}

export interface Item {
  item_id: number;
  item_code: string;
  item_name: string;
  uom: string;
  unit_price: string | number;
  is_active: boolean;
  created_at?: string;
}

export interface CreateItemPayload {
  item_code: string;
  item_name: string;
  uom: string;
  unit_price: number;
}

export interface UpdateItemPayload {
  item_code: string;
  item_name: string;
  uom: string;
  unit_price: number;
  is_active?: boolean;
}

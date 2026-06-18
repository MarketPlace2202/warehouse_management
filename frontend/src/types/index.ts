export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface MessageResponse {
  message: string;
}

export interface ApiError {
  message: string;
  details?: unknown;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  price: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock_quantity: number;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  stock_quantity?: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone?: string;
}

export interface CustomerUpdate {
  name?: string;
  email?: string;
  phone?: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface Order {
  id: number;
  customer_id: number;
  total_amount: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface OrderCreate {
  customer_id: number;
  items: OrderItemCreate[];
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  price: string;
  stock_quantity: number;
  updated_at: string;
}

export interface DashboardStats {
  total_products: number;
  total_customers: number;
  total_orders: number;
  low_stock_products: number;
}

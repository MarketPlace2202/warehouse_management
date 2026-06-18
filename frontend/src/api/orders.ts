import { apiClient } from "./client";
import type {
  PaginatedResponse,
  PaginationParams,
  Order,
  OrderCreate,
} from "@/types";

export const ordersApi = {
  list: (params: PaginationParams = {}) =>
    apiClient.get<PaginatedResponse<Order>>("/api/orders", { params }),

  get: (id: number) => apiClient.get<Order>(`/api/orders/${id}`),

  create: (data: OrderCreate) =>
    apiClient.post<Order>("/api/orders", data),
};

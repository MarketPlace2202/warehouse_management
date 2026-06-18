import { apiClient } from "./client";
import type {
  PaginatedResponse,
  PaginationParams,
  Customer,
  CustomerCreate,
  CustomerUpdate,
  MessageResponse,
} from "@/types";

export const customersApi = {
  list: (params: PaginationParams = {}) =>
    apiClient.get<PaginatedResponse<Customer>>("/api/customers", { params }),

  get: (id: number) => apiClient.get<Customer>(`/api/customers/${id}`),

  create: (data: CustomerCreate) =>
    apiClient.post<Customer>("/api/customers", data),

  update: (id: number, data: CustomerUpdate) =>
    apiClient.put<Customer>(`/api/customers/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<MessageResponse>(`/api/customers/${id}`),
};

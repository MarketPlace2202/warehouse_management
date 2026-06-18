import { apiClient } from "./client";
import type {
  PaginatedResponse,
  PaginationParams,
  Product,
  ProductCreate,
  ProductUpdate,
  MessageResponse,
} from "@/types";

export const productsApi = {
  list: (params: PaginationParams = {}) =>
    apiClient.get<PaginatedResponse<Product>>("/api/products", { params }),

  get: (id: number) => apiClient.get<Product>(`/api/products/${id}`),

  create: (data: ProductCreate) =>
    apiClient.post<Product>("/api/products", data),

  update: (id: number, data: ProductUpdate) =>
    apiClient.put<Product>(`/api/products/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<MessageResponse>(`/api/products/${id}`),
};

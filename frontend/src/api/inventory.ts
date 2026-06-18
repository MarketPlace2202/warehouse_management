import { apiClient } from "./client";
import type {
  PaginatedResponse,
  PaginationParams,
  InventoryItem,
  DashboardStats,
} from "@/types";

export const inventoryApi = {
  list: (params: PaginationParams = {}) =>
    apiClient.get<PaginatedResponse<InventoryItem>>("/api/inventory", { params }),

  dashboardStats: () =>
    apiClient.get<DashboardStats>("/api/inventory/dashboard-stats"),
};

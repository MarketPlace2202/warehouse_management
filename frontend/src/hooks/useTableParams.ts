import { useState, useCallback } from "react";
import type { PaginationParams } from "@/types";

export function useTableParams(defaults: PaginationParams = {}) {
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    page_size: 10,
    sort_order: "asc",
    ...defaults,
  });

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search: search || undefined, page: 1 }));
  }, []);

  const setSort = useCallback((sort_by: string) => {
    setParams((prev) => ({
      ...prev,
      sort_by,
      sort_order: prev.sort_by === sort_by && prev.sort_order === "asc" ? "desc" : "asc",
      page: 1,
    }));
  }, []);

  return { params, setPage, setSearch, setSort };
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showSuccess = useCallback((message: string) => {
    setToast({ message, type: "success" });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setToast({ message, type: "error" });
    setTimeout(() => setToast(null), 5000);
  }, []);

  return { toast, showSuccess, showError };
}

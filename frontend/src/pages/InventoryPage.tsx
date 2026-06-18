import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api";
import type { InventoryItem } from "@/types";
import { useTableParams } from "@/hooks/useTableParams";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";

const LOW_STOCK_THRESHOLD = 10;

export function InventoryPage() {
  const { params, setPage, setSearch, setSort } = useTableParams({
    sort_by: "stock_quantity",
    sort_order: "asc",
  });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", params],
    queryFn: () => inventoryApi.list(params).then((r) => r.data),
  });

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Monitor stock levels across all products"
      />

      <div className="card">
        <div className="mb-4 max-w-sm">
          <SearchBar
            value={searchInput}
            onChange={(v) => { setSearchInput(v); setSearch(v); }}
            placeholder="Search by name or SKU..."
          />
        </div>

        <DataTable
          columns={[
            { key: "name", header: "Product", sortable: true, render: (i: InventoryItem) => i.name },
            { key: "sku", header: "SKU", sortable: true, render: (i: InventoryItem) => (
              <span className="font-mono text-xs">{i.sku}</span>
            )},
            { key: "price", header: "Price", sortable: true, render: (i: InventoryItem) => `$${Number(i.price).toFixed(2)}` },
            { key: "stock_quantity", header: "Stock", sortable: true, render: (i: InventoryItem) => {
              const isLow = i.stock_quantity <= LOW_STOCK_THRESHOLD;
              return (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isLow ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                }`}>
                  {isLow && "⚠ "}{i.stock_quantity}
                </span>
              );
            }},
            { key: "updated_at", header: "Last Updated", sortable: true, render: (i: InventoryItem) =>
              new Date(i.updated_at).toLocaleString()
            },
          ]}
          data={data?.items ?? []}
          sortBy={params.sort_by}
          sortOrder={params.sort_order}
          onSort={setSort}
          isLoading={isLoading}
        />

        {data && (
          <Pagination page={data.page} totalPages={data.total_pages} total={data.total} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}

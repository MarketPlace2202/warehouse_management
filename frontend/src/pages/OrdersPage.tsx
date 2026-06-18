import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, customersApi, productsApi, getErrorMessage } from "@/api";
import type { Order, OrderItemCreate } from "@/types";
import { useTableParams, useToast } from "@/hooks/useTableParams";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";

interface OrderLine {
  product_id: string;
  quantity: string;
}

export function OrdersPage() {
  const queryClient = useQueryClient();
  const { params, setPage, setSort } = useTableParams({ sort_by: "created_at", sort_order: "desc" });
  const { toast, showSuccess, showError } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<OrderLine[]>([{ product_id: "", quantity: "1" }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersApi.list(params).then((r) => r.data),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers-all"],
    queryFn: () => customersApi.list({ page: 1, page_size: 100 }).then((r) => r.data),
    enabled: modalOpen,
  });

  const { data: products } = useQuery({
    queryKey: ["products-all"],
    queryFn: () => productsApi.list({ page: 1, page_size: 100 }).then((r) => r.data),
    enabled: modalOpen,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { customer_id: number; items: OrderItemCreate[] }) =>
      ordersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      showSuccess("Order created successfully");
      closeModal();
    },
    onError: (err) => showError(getErrorMessage(err)),
  });

  const closeModal = () => {
    setModalOpen(false);
    setCustomerId("");
    setItems([{ product_id: "", quantity: "1" }]);
    setFormError(null);
  };

  const addLine = () => setItems([...items, { product_id: "", quantity: "1" }]);

  const removeLine = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof OrderLine, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setFormError("Please select a customer");
      return;
    }

    const orderItems: OrderItemCreate[] = [];
    for (const line of items) {
      if (!line.product_id) {
        setFormError("Please select a product for each line item");
        return;
      }
      const qty = Number(line.quantity);
      if (!qty || qty <= 0) {
        setFormError("Quantity must be greater than 0");
        return;
      }
      orderItems.push({ product_id: Number(line.product_id), quantity: qty });
    }

    setFormError(null);
    createMutation.mutate({ customer_id: Number(customerId), items: orderItems });
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        description="View and create customer orders"
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            + Create Order
          </button>
        }
      />

      <div className="card">
        <DataTable
          columns={[
            { key: "id", header: "Order #", sortable: true, render: (o: Order) => `#${o.id}` },
            { key: "customer_id", header: "Customer ID", sortable: true, render: (o: Order) => o.customer_id },
            { key: "total_amount", header: "Total", sortable: true, render: (o: Order) => `$${Number(o.total_amount).toFixed(2)}` },
            { key: "status", header: "Status", sortable: true, render: (o: Order) => (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {o.status}
              </span>
            )},
            { key: "created_at", header: "Date", sortable: true, render: (o: Order) =>
              new Date(o.created_at).toLocaleString()
            },
            { key: "actions", header: "Actions", render: (o: Order) => (
              <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => setDetailOrder(o)}>
                View
              </button>
            )},
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

      <Modal isOpen={modalOpen} onClose={closeModal} title="Create Order">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>
          )}
          <div>
            <label className="label">Customer</label>
            <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select customer...</option>
              {customers?.items.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Order Items</label>
            {items.map((line, idx) => (
              <div key={idx} className="mb-2 flex gap-2">
                <select
                  className="input flex-1"
                  value={line.product_id}
                  onChange={(e) => updateLine(idx, "product_id", e.target.value)}
                >
                  <option value="">Select product...</option>
                  {products?.items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock_quantity}) — ${Number(p.price).toFixed(2)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="input w-20"
                  value={line.quantity}
                  onChange={(e) => updateLine(idx, "quantity", e.target.value)}
                />
                {items.length > 1 && (
                  <button type="button" className="btn-danger !px-2" onClick={() => removeLine(idx)}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="btn-secondary mt-1 !py-1 text-xs" onClick={addLine}>
              + Add Item
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!detailOrder} onClose={() => setDetailOrder(null)} title={`Order #${detailOrder?.id}`}>
        {detailOrder && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-slate-500">Customer:</span> #{detailOrder.customer_id}</div>
              <div><span className="text-slate-500">Status:</span> {detailOrder.status}</div>
              <div><span className="text-slate-500">Total:</span> ${Number(detailOrder.total_amount).toFixed(2)}</div>
              <div><span className="text-slate-500">Date:</span> {new Date(detailOrder.created_at).toLocaleString()}</div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2">Product</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Unit Price</th>
                  <th className="py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detailOrder.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2">#{item.product_id}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">${Number(item.unit_price).toFixed(2)}</td>
                    <td className="py-2">${Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => {}} />}
    </div>
  );
}

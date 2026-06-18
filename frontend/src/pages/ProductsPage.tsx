import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, getErrorMessage } from "@/api";
import type { Product, ProductCreate, ProductUpdate } from "@/types";
import { useTableParams, useToast } from "@/hooks/useTableParams";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";

interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  price: string;
  stock_quantity: string;
}

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  sku: "",
  price: "",
  stock_quantity: "",
};

function validateForm(data: ProductFormData): string | null {
  if (!data.name.trim()) return "Name is required";
  if (!data.sku.trim()) return "SKU is required";
  if (!data.price || Number(data.price) <= 0) return "Price must be greater than 0";
  if (!data.stock_quantity || Number(data.stock_quantity) < 0) return "Stock must be 0 or more";
  return null;
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const { params, setPage, setSearch, setSort } = useTableParams({ sort_by: "created_at", sort_order: "desc" });
  const { toast, showSuccess, showError } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.list(params).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: ProductCreate) => productsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      showSuccess("Product created successfully");
      closeModal();
    },
    onError: (err) => showError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductUpdate }) =>
      productsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showSuccess("Product updated successfully");
      closeModal();
    },
    onError: (err) => showError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      showSuccess("Product deleted successfully");
    },
    onError: (err) => showError(getErrorMessage(err)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || "",
      sku: product.sku,
      price: product.price,
      stock_quantity: String(product.stock_quantity),
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm(form);
    if (error) {
      setFormError(error);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      sku: form.sku.trim(),
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setSearch(value);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Add Product
          </button>
        }
      />

      <div className="card">
        <div className="mb-4 max-w-sm">
          <SearchBar value={searchInput} onChange={handleSearch} placeholder="Search by name or SKU..." />
        </div>

        <DataTable
          columns={[
            { key: "name", header: "Name", sortable: true, render: (p: Product) => p.name },
            { key: "sku", header: "SKU", sortable: true, render: (p: Product) => (
              <span className="font-mono text-xs">{p.sku}</span>
            )},
            { key: "price", header: "Price", sortable: true, render: (p: Product) => `$${Number(p.price).toFixed(2)}` },
            { key: "stock_quantity", header: "Stock", sortable: true, render: (p: Product) => (
              <span className={p.stock_quantity <= 10 ? "font-medium text-orange-600" : ""}>
                {p.stock_quantity}
              </span>
            )},
            { key: "actions", header: "Actions", render: (p: Product) => (
              <div className="flex gap-2">
                <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => openEdit(p)}>Edit</button>
                <button
                  className="btn-danger !px-2 !py-1 text-xs"
                  onClick={() => {
                    if (confirm(`Delete product "${p.name}"?`)) deleteMutation.mutate(p.id);
                  }}
                >
                  Delete
                </button>
              </div>
            )},
          ]}
          data={data?.items ?? []}
          sortBy={params.sort_by}
          sortOrder={params.sort_order}
          onSort={setSort}
          isLoading={isLoading}
        />

        {data && (
          <Pagination
            page={data.page}
            totalPages={data.total_pages}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? "Edit Product" : "Add Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>
          )}
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">SKU</label>
            <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price</label>
              <input type="number" step="0.01" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="label">Stock Quantity</label>
              <input type="number" min="0" className="input" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => {}} />}
    </div>
  );
}

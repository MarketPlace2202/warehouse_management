import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi, getErrorMessage } from "@/api";
import type { Customer, CustomerCreate, CustomerUpdate } from "@/types";
import { useTableParams, useToast } from "@/hooks/useTableParams";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
}

const emptyForm: CustomerFormData = { name: "", email: "", phone: "" };

function validateForm(data: CustomerFormData): string | null {
  if (!data.name.trim()) return "Name is required";
  if (!data.email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Invalid email format";
  return null;
}

export function CustomersPage() {
  const queryClient = useQueryClient();
  const { params, setPage, setSearch, setSort } = useTableParams({ sort_by: "created_at", sort_order: "desc" });
  const { toast, showSuccess, showError } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", params],
    queryFn: () => customersApi.list(params).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CustomerCreate) => customersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      showSuccess("Customer created successfully");
      closeModal();
    },
    onError: (err) => showError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CustomerUpdate }) =>
      customersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      showSuccess("Customer updated successfully");
      closeModal();
    },
    onError: (err) => showError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      showSuccess("Customer deleted successfully");
    },
    onError: (err) => showError(getErrorMessage(err)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setForm({ name: customer.name, email: customer.email, phone: customer.phone || "" });
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
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage your customer database"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Add Customer
          </button>
        }
      />

      <div className="card">
        <div className="mb-4 max-w-sm">
          <SearchBar value={searchInput} onChange={(v) => { setSearchInput(v); setSearch(v); }} placeholder="Search by name or email..." />
        </div>

        <DataTable
          columns={[
            { key: "name", header: "Name", sortable: true, render: (c: Customer) => c.name },
            { key: "email", header: "Email", sortable: true, render: (c: Customer) => c.email },
            { key: "phone", header: "Phone", render: (c: Customer) => c.phone || "—" },
            { key: "created_at", header: "Created", sortable: true, render: (c: Customer) =>
              new Date(c.created_at).toLocaleDateString()
            },
            { key: "actions", header: "Actions", render: (c: Customer) => (
              <div className="flex gap-2">
                <button className="btn-secondary !px-2 !py-1 text-xs" onClick={() => openEdit(c)}>Edit</button>
                <button
                  className="btn-danger !px-2 !py-1 text-xs"
                  onClick={() => {
                    if (confirm(`Delete customer "${c.name}"?`)) deleteMutation.mutate(c.id);
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
          <Pagination page={data.page} totalPages={data.total_pages} total={data.total} onPageChange={setPage} />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>
          )}
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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

"use client";

import { FormEvent, useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface Props {
  categories: Category[];
}

export function CategoryManager({ categories }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createError, setCreateError] = useState("");
  const createInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Focus input when dialog opens
  useEffect(() => {
    if (createOpen) {
      setTimeout(() => createInputRef.current?.focus(), 50);
    } else {
      setCreateName("");
      setCreateError("");
    }
  }, [createOpen]);

  function openCreate() {
    setCreateOpen(true);
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = createName.trim();
    if (!trimmed) return;

    const duplicate = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setCreateError(`"${trimmed}" already exists.`);
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) {
        setCreateError("Failed to create category. Please try again.");
        return;
      }
      showToast({ title: "Category added", variant: "success" });
      setCreateOpen(false);
      router.refresh();
    });
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  function save(id: string) {
    const trimmed = editName.trim();
    if (!trimmed) return;

    const duplicate = categories.some(
      (c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      showToast({ title: `"${trimmed}" already exists`, variant: "error" });
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) {
        showToast({ title: "Update failed", variant: "error" });
        return;
      }
      showToast({ title: "Category updated", variant: "success" });
      setEditingId(null);
      setEditName("");
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!response.ok) {
        showToast({ title: "Delete failed", variant: "error" });
        return;
      }
      showToast({ title: "Category deleted", variant: "success" });
      router.refresh();
    });
  }

  return (
    <section className="space-y-5">
      {/* Header with New Category button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500">{categories.length} total</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Category
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-slate-500">No categories yet. Create one to get started.</p>
          </div>
        ) : (
          <table className="w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {editingId === category.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") save(category.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{category.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{category.slug}</td>
                  <td className="px-4 py-3 text-slate-500">{category._count?.products ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {editingId === category.id ? (
                        <>
                          {/* Save */}
                          <button
                            onClick={() => save(category.id)}
                            disabled={pending}
                            title="Save"
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white hover:bg-black disabled:opacity-60"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </button>
                          {/* Cancel */}
                          <button
                            onClick={cancelEdit}
                            title="Cancel"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Edit */}
                          <button
                            onClick={() => startEdit(category)}
                            title="Edit category"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setConfirmId(category.id)}
                            title="Delete category"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Category Dialog */}
      <Modal
        open={createOpen}
        title="New Category"
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-category-form"
              disabled={pending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              {pending ? "Creating…" : "Create"}
            </button>
          </div>
        }
      >
        <form id="create-category-form" onSubmit={handleCreate} className="space-y-3">
          <div>
            <label htmlFor="create-cat-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Category name
            </label>
            <input
              id="create-cat-name"
              ref={createInputRef}
              value={createName}
              onChange={(e) => { setCreateName(e.target.value); setCreateError(""); }}
              placeholder="e.g. Accessories"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ring-slate-900 transition focus:ring-2 ${
                createError ? "border-red-400 bg-red-50" : "border-slate-300 focus:border-slate-400"
              }`}
            />
            {createError && (
              <p className="mt-1.5 text-xs text-red-600">{createError}</p>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Delete category?"
        description="This will permanently remove the category and may unassign products."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) remove(confirmId);
          setConfirmId(null);
        }}
      />
    </section>
  );
}

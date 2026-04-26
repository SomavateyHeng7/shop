"use client";

import { FormEvent, useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

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
  const { showToast } = useToast();

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createError, setCreateError] = useState("");
  const createInputRef = useRef<HTMLInputElement>(null);

  // Edit dialog
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Delete confirm
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  // Focus inputs when dialogs open
  useEffect(() => {
    if (createOpen) {
      setTimeout(() => createInputRef.current?.focus(), 50);
    } else {
      setCreateName("");
      setCreateError("");
    }
  }, [createOpen]);

  useEffect(() => {
    if (editCategory) {
      setTimeout(() => editInputRef.current?.focus(), 50);
    } else {
      setEditError("");
    }
  }, [editCategory]);

  // --- Create ---
  function handleCreate(e: FormEvent) {
    e.preventDefault();
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
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.status === 409) {
        setCreateError(`"${trimmed}" already exists.`);
        return;
      }
      if (!res.ok) {
        setCreateError("Failed to create. Please try again.");
        return;
      }
      showToast({ title: "Category created", variant: "success" });
      setCreateOpen(false);
      router.refresh();
    });
  }

  // --- Edit ---
  function openEdit(category: Category) {
    setEditCategory(category);
    setEditName(category.name);
    setEditError("");
  }

  function handleEdit(e: FormEvent) {
    e.preventDefault();
    if (!editCategory) return;
    const trimmed = editName.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === editCategory.name.toLowerCase()) {
      setEditCategory(null);
      return;
    }

    const duplicate = categories.some(
      (c) => c.id !== editCategory.id && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setEditError(`"${trimmed}" already exists.`);
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/admin/categories/${editCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.status === 409) {
        setEditError(`"${trimmed}" already exists.`);
        return;
      }
      if (!res.ok) {
        setEditError("Failed to update. Please try again.");
        return;
      }
      showToast({ title: "Category updated", variant: "success" });
      setEditCategory(null);
      router.refresh();
    });
  }

  // --- Delete ---
  function handleDelete() {
    if (!deleteCategory) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/categories/${deleteCategory.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        showToast({ title: "Delete failed", variant: "error" });
        return;
      }
      showToast({ title: "Category deleted", variant: "success" });
      setDeleteCategory(null);
      router.refresh();
    });
  }

  const deleteProductCount = deleteCategory?._count?.products ?? 0;

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500">{categories.length} total</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
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
                  <td className="px-4 py-3 font-medium text-slate-900">{category.name}</td>
                  <td className="px-4 py-3 text-slate-500">{category.slug}</td>
                  <td className="px-4 py-3 text-slate-500">{category._count?.products ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(category)}
                        title="Edit category"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteCategory(category)}
                        title="Delete category"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create dialog */}
      <Modal
        open={createOpen}
        title="New Category"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-category-form" disabled={pending}>
              {pending ? "Creating…" : "Create"}
            </Button>
          </>
        }
      >
        <form id="create-category-form" onSubmit={handleCreate}>
          <label htmlFor="create-cat-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Category name
          </label>
          <input
            id="create-cat-name"
            ref={createInputRef}
            value={createName}
            onChange={(e) => { setCreateName(e.target.value); setCreateError(""); }}
            placeholder="e.g. Accessories"
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-slate-900 ${
              createError ? "border-red-400 bg-red-50" : "border-slate-300 focus:border-slate-400"
            }`}
          />
          {createError && (
            <p className="mt-1.5 text-xs text-red-600">{createError}</p>
          )}
        </form>
      </Modal>

      {/* Edit dialog */}
      <Modal
        open={!!editCategory}
        title="Edit Category"
        onClose={() => setEditCategory(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditCategory(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-category-form" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <form id="edit-category-form" onSubmit={handleEdit}>
          <label htmlFor="edit-cat-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Category name
          </label>
          <input
            id="edit-cat-name"
            ref={editInputRef}
            value={editName}
            onChange={(e) => { setEditName(e.target.value); setEditError(""); }}
            placeholder="Category name"
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-slate-900 ${
              editError ? "border-red-400 bg-red-50" : "border-slate-300 focus:border-slate-400"
            }`}
          />
          {editError && (
            <p className="mt-1.5 text-xs text-red-600">{editError}</p>
          )}
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteCategory}
        title="Delete category?"
        onClose={() => setDeleteCategory(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteCategory(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={pending}>
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            You are about to delete{" "}
            <span className="font-semibold text-slate-900">{deleteCategory?.name}</span>.
          </p>
          {deleteProductCount > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
              <p className="font-semibold">
                {deleteProductCount} product{deleteProductCount !== 1 ? "s" : ""} will be affected.
              </p>
              <p className="mt-0.5 text-xs">
                Those products will have no category and will appear as{" "}
                <span className="font-semibold">N/A</span> in the catalog until you reassign them.
              </p>
            </div>
          ) : (
            <p className="text-slate-500">No products are assigned to this category.</p>
          )}
        </div>
      </Modal>
    </section>
  );
}

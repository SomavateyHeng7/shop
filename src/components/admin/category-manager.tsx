"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const [name, setName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { showToast } = useToast();

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const nextName = String(formData.get("name") ?? "").trim();
    if (!nextName) return;

    startTransition(async () => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName }),
      });
      if (!response.ok) {
        showToast({ title: "Category creation failed", variant: "error" });
        return;
      }
      showToast({ title: "Category added", variant: "success" });
      form.reset();
      router.refresh();
    });
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
  }

  function save(id: string) {
    if (!name.trim()) return;

    startTransition(async () => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!response.ok) {
        showToast({ title: "Update failed", variant: "error" });
        return;
      }
      showToast({ title: "Category updated", variant: "success" });
      setEditingId(null);
      setName("");
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
      <form onSubmit={create} className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm font-semibold text-slate-800">Add Category</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            name="name"
            required
            placeholder="Category name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            disabled={pending}
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3">
                  {editingId === category.id ? (
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-md border border-slate-300 px-2 py-1"
                    />
                  ) : (
                    <span className="font-medium text-slate-900">{category.name}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{category.slug}</td>
                <td className="px-4 py-3 text-slate-600">{category._count?.products ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {editingId === category.id ? (
                      <button
                        onClick={() => save(category.id)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(category)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmId(category.id)}
                      className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

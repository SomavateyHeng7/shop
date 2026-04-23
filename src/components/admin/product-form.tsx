"use client";

import { ChangeEvent, FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductInput {
  id: string;
  name: string;
  description: string | null;
  price: string | number | { toString(): string };
  imageUrl: string | null;
  categoryId: string | null;
  stock: number;
  lowStockAt: number;
  isActive: boolean;
}

interface Props {
  mode: "create" | "edit";
  categories: CategoryOption[];
  product?: ProductInput;
}

export function ProductForm({ mode, categories, product }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();

  const defaults = useMemo(
    () => ({
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: Number(product?.price ?? 0),
      imageUrl: product?.imageUrl ?? "",
      categoryId: product?.categoryId ?? "",
      stock: product?.stock ?? 0,
      lowStockAt: product?.lowStockAt ?? 5,
      isActive: product?.isActive ?? true,
    }),
    [product]
  );

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!response.ok) {
      setError("Image upload failed.");
      showToast({ title: "Image upload failed", variant: "error" });
      return;
    }

    const data = (await response.json()) as { url: string };
    const input = document.getElementById("imageUrl") as HTMLInputElement | null;
    if (input) input.value = data.url;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price") ?? 0),
      imageUrl: String(formData.get("imageUrl") ?? ""),
      categoryId: String(formData.get("categoryId") ?? "") || null,
      stock: Number(formData.get("stock") ?? 0),
      lowStockAt: Number(formData.get("lowStockAt") ?? 5),
      isActive: formData.get("isActive") === "on",
    };

    startTransition(async () => {
      const endpoint =
        mode === "create" ? "/api/admin/products" : `/api/admin/products/${product?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError("Failed to save product.");
        showToast({ title: "Save failed", description: "Please check the form.", variant: "error" });
        return;
      }

      showToast({
        title: mode === "create" ? "Product created" : "Changes saved",
        variant: "success",
      });

      router.push("/admin/products");
      router.refresh();
    });
  }

  async function archive() {
    if (!product) return;

    startTransition(async () => {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setError("Could not archive product.");
        showToast({ title: "Archive failed", variant: "error" });
        return;
      }
      showToast({ title: "Product archived", variant: "success" });
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={defaults.name}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={defaults.description}
          rows={5}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="price">
            Price
          </label>
          <input
            id="price"
            type="number"
            min={0}
            step="0.01"
            name="price"
            defaultValue={defaults.price}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="categoryId">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={defaults.categoryId}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="stock">
            Stock
          </label>
          <input
            id="stock"
            type="number"
            min={0}
            name="stock"
            defaultValue={defaults.stock}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="lowStockAt">
            Low stock threshold
          </label>
          <input
            id="lowStockAt"
            type="number"
            min={0}
            name="lowStockAt"
            defaultValue={defaults.lowStockAt}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="imageUrl">
          Image URL
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          defaultValue={defaults.imageUrl}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <label className="mt-2 block text-sm font-medium text-slate-700" htmlFor="upload">
          Or upload image
        </label>
        <input
          id="upload"
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="mt-1 block w-full text-sm"
        />
        {uploading && <p className="mt-2 text-xs text-slate-500">Uploading image...</p>}
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="isActive" defaultChecked={defaults.isActive} />
        Active product
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {pending ? "Saving" : mode === "create" ? "Create Product" : "Save Changes"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={pending}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Archive Product
          </button>
        )}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Archive product?"
        description="This will hide the product from the storefront until re-enabled."
        confirmLabel="Archive"
        cancelLabel="Cancel"
        variant="danger"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          archive();
        }}
      />
    </form>
  );
}

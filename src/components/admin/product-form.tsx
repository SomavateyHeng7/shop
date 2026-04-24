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

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  categoryId: string;
  stock: string;
  lowStockAt: string;
  isActive: boolean;
}

export function ProductForm({ mode, categories, product }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();

  const defaults = useMemo<ProductFormState>(
    () => ({
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: String(product?.price ?? ""),
      imageUrl: product?.imageUrl ?? "",
      categoryId: product?.categoryId ?? "",
      stock: String(product?.stock ?? 0),
      lowStockAt: String(product?.lowStockAt ?? 5),
      isActive: product?.isActive ?? true,
    }),
    [product]
  );

  const [form, setForm] = useState<ProductFormState>(defaults);

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

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
    updateField("imageUrl", data.url);
    showToast({ title: "Image uploaded", variant: "success" });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price || 0),
      imageUrl: form.imageUrl.trim(),
      categoryId: form.categoryId || null,
      stock: Number(form.stock || 0),
      lowStockAt: Number(form.lowStockAt || 0),
      isActive: form.isActive,
    };

    startTransition(async () => {
      const endpoint =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${product?.id}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError("Failed to save product.");
        showToast({
          title: "Save failed",
          description: "Please check the form.",
          variant: "error",
        });
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

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {mode === "create" ? "New product" : "Edit product"}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                {mode === "create" ? "Create product" : form.name || "Product details"}
              </h2>
            </div>

            <label className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <span className="text-sm font-medium text-slate-700">
                {form.isActive ? "Active" : "Draft"}
              </span>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => updateField("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-950">
                  Basic information
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add the product name, description, price, and category.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass} htmlFor="name">
                    Product name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    required
                    placeholder="Example: Classic black hoodie"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    rows={6}
                    placeholder="Write a short product description."
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="price">
                      Price
                    </label>
                    <input
                      id="price"
                      type="number"
                      min={0}
                      step="0.01"
                      name="price"
                      value={form.price}
                      onChange={(event) => updateField("price", event.target.value)}
                      required
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="categoryId">
                      Category
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={form.categoryId}
                      onChange={(event) =>
                        updateField("categoryId", event.target.value)
                      }
                      className={inputClass}
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
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-950">
                  Inventory
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Track available quantity and low stock alerts.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="stock">
                    Stock
                  </label>
                  <input
                    id="stock"
                    type="number"
                    min={0}
                    name="stock"
                    value={form.stock}
                    onChange={(event) => updateField("stock", event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="lowStockAt">
                    Low stock threshold
                  </label>
                  <input
                    id="lowStockAt"
                    type="number"
                    min={0}
                    name="lowStockAt"
                    value={form.lowStockAt}
                    onChange={(event) =>
                      updateField("lowStockAt", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-950">
                  Product image
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Upload an image or paste an image URL.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt={form.name || "Product preview"}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center px-6 text-center">
                    <div>
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                        IMG
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        No image selected
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Preview appears here after upload.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className={labelClass} htmlFor="imageUrl">
                    Image URL
                  </label>
                  <input
                    id="imageUrl"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={(event) =>
                      updateField("imageUrl", event.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="upload">
                    Upload image
                  </label>
                  <input
                    id="upload"
                    type="file"
                    accept="image/*"
                    onChange={onUpload}
                    disabled={uploading || pending}
                    className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  {uploading && (
                    <p className="mt-2 text-xs text-slate-500">
                      Uploading image...
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-base font-semibold text-slate-950">
                Summary
              </h3>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-medium text-slate-900">
                    {form.isActive ? "Active" : "Draft"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Price</dt>
                  <dd className="font-medium text-slate-900">
                    ${Number(form.price || 0).toFixed(2)}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Stock</dt>
                  <dd className="font-medium text-slate-900">
                    {Number(form.stock || 0)}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>

        {error && (
          <div className="mx-6 mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {mode === "edit" && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={pending}
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Archive product
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              disabled={pending}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={pending || uploading}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending
                ? "Saving..."
                : mode === "create"
                  ? "Create product"
                  : "Save changes"}
            </button>
          </div>
        </div>
      </form>

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
    </>
  );
}
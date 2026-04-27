"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductInput {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string | null;
  stock: number;
  lowStockAt: number;
  isActive: boolean;
  preOrder: boolean;
}

interface FinanceData {
  boughtPrice: string;
  deliveryPrice: string;
  discountPct: string;
}

interface Props {
  mode: "create" | "edit";
  categories: CategoryOption[];
  product?: ProductInput;
  financeData?: FinanceData | null;
  onSuccess?: () => void;
}

export function ProductForm({
  mode,
  categories,
  product,
  financeData,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(
    product?.imageUrl ?? null,
  );
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();

  // Pricing state
  const [sellPrice, setSellPrice] = useState(String(product?.price ?? ""));
  const [boughtPrice, setBoughtPrice] = useState(
    financeData?.boughtPrice ?? "",
  );
  const [deliveryPrice, setDeliveryPrice] = useState(
    financeData?.deliveryPrice ?? "",
  );
  const [discountPct, setDiscountPct] = useState(
    financeData?.discountPct ?? "",
  );

  const defaults = useMemo(
    () => ({
      name: product?.name ?? "",
      description: product?.description ?? "",
      categoryId: product?.categoryId ?? "",
      stock: String(product?.stock ?? 0),
      lowStockAt: String(product?.lowStockAt ?? 5),
      isActive: product?.isActive ?? true,
      preOrder: product?.preOrder ?? false,
    }),
    [product],
  );

  // Live profit preview
  const sell = Number(sellPrice) || 0;
  const bought = Number(boughtPrice) || 0;
  const delivery = Number(deliveryPrice) || 0;
  const discount = Math.min(Math.max(Number(discountPct) || 0, 0), 100);
  const finalPrice = sell * (1 - discount / 100);
  const profitPerUnit = finalPrice - bought - delivery;

  async function uploadFile(file: File) {
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
    setImageUrl(data.url);
  }

  function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) uploadFile(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) uploadFile(file);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(sellPrice) || 0,
      imageUrl: imageUrl || null,
      categoryId: String(formData.get("categoryId") ?? "") || null,
      stock: Number(formData.get("stock") ?? 0),
      lowStockAt: Number(formData.get("lowStockAt") ?? 5),
      isActive: formData.get("isActive") === "on",
      preOrder: formData.get("preOrder") === "on",
    };

    startTransition(async () => {
      const endpoint =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${product?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const productRes = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!productRes.ok) {
        setError("Failed to save product.");
        showToast({
          title: "Save failed",
          description: "Please check the form.",
          variant: "error",
        });
        return;
      }

      const saved = (await productRes.json()) as { id: string };
      const productId = saved.id;

      const hasPricing = sellPrice || boughtPrice || deliveryPrice || discountPct;
      if (hasPricing) {
        const pricingRes = await fetch(
          `/api/admin/finance/products/${productId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sellPrice: Number(sellPrice) || 0,
              boughtPrice: Number(boughtPrice) || 0,
              deliveryPrice: Number(deliveryPrice) || 0,
              discountPct: Number(discountPct) || 0,
            }),
          },
        );
        if (!pricingRes.ok) {
          showToast({
            title: "Product saved but pricing failed to save",
            variant: "error",
          });
          return;
        }
      }

      showToast({
        title: mode === "create" ? "Product created" : "Changes saved",
        variant: "success",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/products");
      }
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

  const submitLabel = pending
    ? "Saving…"
    : mode === "create"
      ? "Create Product"
      : "Save Changes";

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            {mode === "create"
              ? "Fill in the fields, then create the product."
              : "Update product details and click Save Changes."}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              {submitLabel}
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
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="name"
            >
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
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={defaults.description}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="categoryId"
            >
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={defaults.categoryId}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {mode === "create" && (
              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700"
                  htmlFor="stock"
                >
                  Initial Stock
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
            )}
            {mode === "edit" && (
              <input type="hidden" name="stock" value={defaults.stock} />
            )}
            <div className={mode === "create" ? "" : "col-span-2"}>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="lowStockAt"
              >
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
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Image
            </label>
            {imageUrl ? (
              <div className="relative w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Product"
                  className="h-40 w-40 rounded-xl object-cover border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3 w-3"
                  >
                    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                  </svg>
                </button>
                <label
                  htmlFor="upload"
                  className="mt-2 flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474ZM4.75 3.5A2.25 2.25 0 0 0 2.5 5.75v5.5A2.25 2.25 0 0 0 4.75 13.5h5.5A2.25 2.25 0 0 0 12.5 11.25V9a.75.75 0 0 0-1.5 0v2.25a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-5.5a.75.75 0 0 1 .75-.75H7a.75.75 0 0 0 0-1.5H4.75Z" />
                  </svg>
                  Change image
                  <input
                    id="upload"
                    type="file"
                    accept="image/*"
                    onChange={onUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            ) : (
              <label
                htmlFor="upload"
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition
                  ${uploading ? "border-slate-300 bg-slate-50" : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"}`}
              >
                {uploading ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="h-8 w-8 animate-spin text-slate-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                    <span className="text-sm text-slate-500">Uploading…</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="h-8 w-8 text-slate-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-slate-700">
                        Click to upload
                      </span>
                      <span className="mx-1 text-sm text-slate-400">
                        or drag and drop
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">PNG, JPG, WEBP</span>
                  </>
                )}
                <input
                  id="upload"
                  type="file"
                  accept="image/*"
                  onChange={onUpload}
                  className="sr-only"
                />
              </label>
            )}
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={defaults.isActive}
              />
              Active product
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="preOrder"
                defaultChecked={defaults.preOrder}
              />
              <span>
                Pre-Order
                <span className="ml-1.5 rounded-full bg-[#ede5f7] px-2 py-0.5 text-[10px] font-semibold text-[#4a3860]">
                  shows Pre-Order badge
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4 border-t border-slate-200 pt-6">
          <p className="text-sm font-semibold text-slate-900">Pricing</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Sell Price ($){" "}
                <span className="text-slate-400 font-normal">— charged to customer</span>
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Bought Price ($){" "}
                <span className="text-slate-400 font-normal">— paid to supplier</span>
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={boughtPrice}
                onChange={(e) => setBoughtPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Delivery ($){" "}
                <span className="text-slate-400 font-normal">— shipping per unit</span>
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={deliveryPrice}
                onChange={(e) => setDeliveryPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Discount (%){" "}
                <span className="text-slate-400 font-normal">— optional</span>
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {sell > 0 && (
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Final price to customer</span>
                <span>
                  {formatPrice(finalPrice)}
                  {discount > 0 && (
                    <span className="ml-1 text-xs text-slate-400">
                      ({discount}% off)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cost per unit (bought + delivery)</span>
                <span>{formatPrice(bought + delivery)}</span>
              </div>
              <div
                className={`flex justify-between border-t border-slate-200 pt-1 font-semibold ${profitPerUnit >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                <span>Profit per unit</span>
                <span>{formatPrice(profitPerUnit)}</span>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {submitLabel}
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

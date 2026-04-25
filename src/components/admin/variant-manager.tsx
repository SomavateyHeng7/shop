"use client";

import { useState, useTransition, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

interface Variant {
  id: string;
  label: string;
  imageUrl: string | null;
  stock: number;
  sortOrder: number;
}

interface Props {
  productId: string;
  initialVariants: Variant[];
}

function VariantStockEditor({
  productId,
  variant,
  onUpdate,
}: {
  productId: string;
  variant: Variant;
  onUpdate: (id: string, newStock: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  function submit(delta: number) {
    const change = delta * parseInt(qty, 10);
    if (!change) return;
    startTransition(async () => {
      const res = await fetch(
        `/api/admin/products/${productId}/variants/${variant.id}/stock`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ change, note: note.trim() || undefined }),
        }
      );
      if (!res.ok) {
        showToast({ title: "Failed to update stock", variant: "error" });
        return;
      }
      const updated = await res.json() as Variant;
      onUpdate(variant.id, updated.stock);
      setOpen(false);
      setQty("1");
      setNote("");
      showToast({
        title: `${change > 0 ? "+" : ""}${change} for ${variant.label}`,
        variant: "success",
      });
    });
  }

  if (open) {
    return (
      <div className="mt-1.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-1">
          <input
            autoFocus
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(1); if (e.key === "Escape") setOpen(false); }}
            className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-xs"
            placeholder="Qty"
          />
        </div>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (opt.)"
          className="w-[5.5rem] rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-600 placeholder:text-slate-400"
        />
        <div className="flex gap-1">
          <button
            type="button"
            disabled={pending}
            onClick={() => submit(1)}
            className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            +Add
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit(-1)}
            className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          >
            -Sub
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1.5">
      <span className="text-xs font-semibold text-slate-700">{variant.stock}</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-100"
      >
        edit
      </button>
    </div>
  );
}

export function VariantManager({ productId, initialVariants }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [variants, setVariants] = useState(initialVariants);
  const [label, setLabel] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [initialStock, setInitialStock] = useState("0");
  const [uploading, setUploading] = useState(false);
  const [adding, startAdd] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);
    if (!res.ok) { showToast({ title: "Image upload failed", variant: "error" }); return; }
    const data = await res.json() as { url: string };
    setImageUrl(data.url);
  }

  function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) uploadFile(file);
  }

  function addVariant() {
    if (!label.trim()) return;
    startAdd(async () => {
      const res = await fetch(`/api/admin/products/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          imageUrl,
          stock: parseInt(initialStock, 10) || 0,
          sortOrder: variants.length,
        }),
      });
      if (!res.ok) { showToast({ title: "Failed to add variant", variant: "error" }); return; }
      const created = await res.json() as Variant;
      setVariants((v) => [...v, created]);
      setLabel("");
      setImageUrl(null);
      setInitialStock("0");
      showToast({ title: `"${created.label}" added`, variant: "success" });
      router.refresh();
    });
  }

  async function deleteVariant(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/admin/products/${productId}/variants/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) { showToast({ title: "Failed to delete variant", variant: "error" }); return; }
    setVariants((v) => v.filter((x) => x.id !== id));
    showToast({ title: "Variant removed", variant: "success" });
    router.refresh();
  }

  function handleStockUpdate(id: string, newStock: number) {
    setVariants((v) => v.map((x) => x.id === id ? { ...x, stock: newStock } : x));
    router.refresh();
  }

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div className="space-y-5">
      {/* Existing variants */}
      {variants.length > 0 && (
        <>
          <div className="flex flex-wrap gap-4">
            {variants.map((v) => (
              <div key={v.id} className="group relative flex flex-col items-center">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  {v.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.imageUrl} alt={v.label} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No img</div>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteVariant(v.id)}
                    disabled={deletingId === v.id}
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
                    title="Remove variant"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white" className="h-5 w-5">
                      <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                    </svg>
                  </button>
                </div>
                <span className="mt-1 max-w-[5rem] truncate text-center text-xs font-medium text-slate-600">{v.label}</span>
                <VariantStockEditor productId={productId} variant={v} onUpdate={handleStockUpdate} />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Total stock across all variants: <span className="font-semibold text-slate-600">{totalStock}</span>
          </p>
        </>
      )}

      {/* Add variant form */}
      <div className="rounded-xl border border-dashed border-slate-300 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add a variant</p>
        <div className="flex flex-wrap items-start gap-3">
          {/* Image drop zone */}
          <label
            htmlFor="variant-upload"
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-center transition hover:border-slate-400 hover:bg-slate-50 shrink-0"
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="preview" className="h-full w-full rounded-xl object-cover" />
            ) : uploading ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6 animate-spin text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span className="mt-1 text-[10px] text-slate-400">Image</span>
              </>
            )}
            <input id="variant-upload" type="file" accept="image/*" onChange={onUpload} className="sr-only" />
          </label>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVariant(); } }}
              placeholder="Color or option name"
              className="h-9 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 w-48"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 whitespace-nowrap">Initial stock:</label>
              <input
                type="number"
                min={0}
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="w-16 h-7 rounded-md border border-slate-300 px-2 text-sm"
              />
            </div>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="text-xs text-slate-400 hover:text-slate-600 text-left"
              >
                ✕ Remove image
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={addVariant}
            disabled={adding || !label.trim()}
            className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

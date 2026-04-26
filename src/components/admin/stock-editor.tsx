"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

interface Props {
  id: string;
  initialStock: number;
}

export function StockEditor({ id, initialStock }: Props) {
  const router = useRouter();
  const [stock, setStock] = useState(initialStock);
  const [savedStock, setSavedStock] = useState(initialStock);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const isDirty = stock !== savedStock;

  function adjust(delta: number) {
    setStock((prev) => Math.max(0, prev + delta));
  }

  function save() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock, note: "Inline update" }),
      });
      if (res.ok) {
        setSavedStock(stock);
        showToast({ title: "Stock updated", variant: "success" });
        router.refresh();
      } else {
        showToast({ title: "Stock update failed", variant: "error" });
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* − */}
      <button
        type="button"
        onClick={() => adjust(-1)}
        disabled={stock === 0 || pending}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      </button>

      {/* Number input */}
      <input
        type="number"
        min={0}
        value={stock}
        onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
        className="w-14 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-center text-sm font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
      />

      {/* + */}
      <button
        type="button"
        onClick={() => adjust(1)}
        disabled={pending}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* Save — only visible when dirty */}
      {isDirty && (
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="flex h-7 items-center gap-1 rounded-md bg-slate-900 px-2.5 text-xs font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {pending ? (
            <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : null}
          {pending ? "Saving…" : "Save"}
        </button>
      )}
    </div>
  );
}

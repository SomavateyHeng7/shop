"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";

interface Props {
  id: string;
  initialStock: number;
}

export function StockEditor({ id, initialStock }: Props) {
  const [stock, setStock] = useState(initialStock);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");
  const { showToast } = useToast();

  const submit = () => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock, note: "Inline update" }),
      });

      if (response.ok) {
        setMessage("Saved");
        showToast({ title: "Stock updated", variant: "success" });
      } else {
        setMessage("Failed");
        showToast({ title: "Stock update failed", variant: "error" });
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <input
        value={stock}
        onChange={(event) => setStock(Number(event.target.value))}
        type="number"
        min={0}
        className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
      />
      <button
        type="button"
        disabled={pending}
        onClick={submit}
        title="Save stock"
        className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white disabled:opacity-60 hover:bg-black"
      >
        {pending ? (
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </button>
    </div>
  );
}

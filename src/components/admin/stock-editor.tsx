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
    <div className="flex items-center gap-2">
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
        className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving" : "Save"}
      </button>
      {message && <span className="text-xs text-slate-500">{message}</span>}
    </div>
  );
}

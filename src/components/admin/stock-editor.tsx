"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

interface Props {
  id: string;
  initialStock: number;
}

export function StockEditor({ id, initialStock }: Props) {
  const router = useRouter();
  const [stock, setStock] = useState(initialStock);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [qty, setQty] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  function openPanel(m: "add" | "remove") {
    setMode(m);
    setQty("1");
    setUnitCost("");
    setNote("");
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function cancel() {
    setOpen(false);
  }

  function submit() {
    const qty_ = parseInt(qty, 10);
    if (!qty_ || qty_ < 1) return;
    const change = mode === "add" ? qty_ : -qty_;

    startTransition(async () => {
      const body: Record<string, unknown> = {
        change,
        note: note.trim() || (mode === "add" ? "Restock" : "Stock adjustment"),
      };
      if (mode === "add" && unitCost !== "") {
        body.unitCost = parseFloat(unitCost);
      }

      const res = await fetch(`/api/admin/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setStock((s) => s + change);
        setOpen(false);
        showToast({
          title: `${change > 0 ? "+" : ""}${change} units${mode === "add" && unitCost ? ` @ $${parseFloat(unitCost).toFixed(2)}/unit` : ""}`,
          variant: "success",
        });
        router.refresh();
      } else {
        const data = await res.json() as { error?: string };
        showToast({ title: data.error ?? "Failed to update stock", variant: "error" });
      }
    });
  }

  if (open) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`text-xs font-semibold ${mode === "add" ? "text-emerald-600" : "text-red-500"}`}>
          {mode === "add" ? "+" : "−"}
        </span>
        <input
          ref={inputRef}
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") cancel(); }}
          placeholder="Qty"
          className="w-14 rounded-md border border-slate-300 px-2 py-1 text-sm"
        />
        {mode === "add" && (
          <input
            type="number"
            min={0}
            step="0.01"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") cancel(); }}
            placeholder="$/unit"
            title="Cost per unit — updates weighted average"
            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
        )}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") cancel(); }}
          placeholder="Note (opt.)"
          className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 placeholder:text-slate-400"
        />
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className={`rounded-md px-2 py-1 text-xs font-semibold text-white disabled:opacity-60 ${mode === "add" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"}`}
        >
          {pending ? "…" : "Save"}
        </button>
        <button
          type="button"
          onClick={cancel}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-900">{stock}</span>
      <button
        type="button"
        onClick={() => openPanel("add")}
        className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
      >
        + Add
      </button>
      <button
        type="button"
        onClick={() => openPanel("remove")}
        className="rounded-md border border-red-200 px-2 py-0.5 text-xs font-medium text-red-500 hover:bg-red-50"
      >
        − Remove
      </button>
    </div>
  );
}

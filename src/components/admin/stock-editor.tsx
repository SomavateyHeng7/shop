"use client";

<<<<<<< HEAD
import { useState, useTransition } from "react";
=======
import { useRef, useState, useTransition } from "react";
>>>>>>> feat/finance
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

interface Props {
  id: string;
  initialStock: number;
}

export function StockEditor({ id, initialStock }: Props) {
  const router = useRouter();
  const [stock, setStock] = useState(initialStock);
<<<<<<< HEAD
  const [savedStock, setSavedStock] = useState(initialStock);
=======
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [qty, setQty] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [note, setNote] = useState("");
>>>>>>> feat/finance
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

<<<<<<< HEAD
  const isDirty = stock !== savedStock;

  function adjust(delta: number) {
    setStock((prev) => Math.max(0, prev + delta));
  }

  function save() {
    startTransition(async () => {
=======
    startTransition(async () => {
      const body: Record<string, unknown> = {
        change,
        note: note.trim() || (mode === "add" ? "Restock" : "Stock adjustment"),
      };
      if (mode === "add" && unitCost !== "") {
        body.unitCost = parseFloat(unitCost);
      }

>>>>>>> feat/finance
      const res = await fetch(`/api/admin/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
<<<<<<< HEAD
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
=======

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
>>>>>>> feat/finance
    </div>
  );
}

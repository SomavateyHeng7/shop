"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatPrice, cn } from "@/lib/utils";

export interface ProductRow {
  id: string;
  name: string;
  price: string;
  stock: number;
  financeData: {
    id: string;
    boughtPrice: string;
    deliveryPrice: string;
    discountPct: string;
  } | null;
}

interface EditState {
  productId: string;
  productName: string;
  sellPrice: string;
  boughtPrice: string;
  deliveryPrice: string;
  discountPct: string;
}

function calcRow(p: ProductRow) {
  const bought = Number(p.financeData?.boughtPrice ?? 0);
  const delivery = Number(p.financeData?.deliveryPrice ?? 0);
  const sell = Number(p.price);
  const discountPct = Number(p.financeData?.discountPct ?? 0);
  const totalCost = bought + delivery;
  const finalPrice = sell * (1 - discountPct / 100);
  const profitPerUnit = finalPrice - totalCost;
  const margin = finalPrice > 0 ? (profitPerUnit / finalPrice) * 100 : 0;
  return { bought, delivery, sell, discountPct, totalCost, finalPrice, profitPerUnit, margin };
}

export function FinanceProducts({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Summary totals
  const summary = products.reduce(
    (acc, p) => {
      const { totalCost, finalPrice, profitPerUnit } = calcRow(p);
      acc.invested += totalCost * p.stock;
      acc.revenue += finalPrice * p.stock;
      acc.profit += profitPerUnit * p.stock;
      return acc;
    },
    { invested: 0, revenue: 0, profit: 0 }
  );
  const avgMargin =
    summary.revenue > 0 ? (summary.profit / summary.revenue) * 100 : 0;

  function openEdit(p: ProductRow) {
    setEdit({
      productId: p.id,
      productName: p.name,
      sellPrice: p.price,
      boughtPrice: p.financeData?.boughtPrice ?? "0",
      deliveryPrice: p.financeData?.deliveryPrice ?? "0",
      discountPct: p.financeData?.discountPct ?? "0",
    });
    setErrors({});
    setEditOpen(true);
  }

  function validate() {
    if (!edit) return false;
    const errs: Record<string, string> = {};
    if (isNaN(Number(edit.sellPrice)) || Number(edit.sellPrice) < 0)
      errs.sellPrice = "Must be ≥ 0";
    if (isNaN(Number(edit.boughtPrice)) || Number(edit.boughtPrice) < 0)
      errs.boughtPrice = "Must be ≥ 0";
    if (isNaN(Number(edit.deliveryPrice)) || Number(edit.deliveryPrice) < 0)
      errs.deliveryPrice = "Must be ≥ 0";
    if (
      isNaN(Number(edit.discountPct)) ||
      Number(edit.discountPct) < 0 ||
      Number(edit.discountPct) > 100
    )
      errs.discountPct = "Must be 0–100";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function save() {
    if (!edit || !validate()) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/finance/products/${edit.productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellPrice: Number(edit.sellPrice),
          boughtPrice: Number(edit.boughtPrice),
          deliveryPrice: Number(edit.deliveryPrice),
          discountPct: Number(edit.discountPct),
        }),
      });
      if (!res.ok) {
        showToast({ title: "Failed to save pricing", variant: "error" });
        return;
      }
      showToast({ title: "Pricing saved", variant: "success" });
      setEditOpen(false);
      router.refresh();
    });
  }

  // Live modal preview
  const previewFinal = edit
    ? Number(edit.sellPrice) * (1 - Number(edit.discountPct) / 100)
    : 0;
  const previewCost = edit
    ? Number(edit.boughtPrice) + Number(edit.deliveryPrice)
    : 0;
  const previewProfit = previewFinal - previewCost;
  const previewMargin = previewFinal > 0 ? (previewProfit / previewFinal) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Invested" value={formatPrice(summary.invested)} />
        <StatCard label="Potential Revenue" value={formatPrice(summary.revenue)} />
        <StatCard
          label="Potential Profit"
          value={formatPrice(summary.profit)}
          highlight={summary.profit >= 0 ? "green" : "red"}
        />
        <StatCard
          label="Avg Margin"
          value={`${avgMargin.toFixed(1)}%`}
          highlight={avgMargin >= 0 ? "green" : "red"}
        />
      </div>

      {/* Product table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Product Pricing</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Cost, sell price, discount, and profit per product.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  { label: "Product", align: "left" },
                  { label: "Stock", align: "right" },
                  { label: "Cost / Unit", align: "right" },
                  { label: "Sell Price", align: "right" },
                  { label: "Discount", align: "right" },
                  { label: "Final Price", align: "right" },
                  { label: "Profit / Unit", align: "right" },
                  { label: "Margin", align: "right" },
                  { label: "", align: "right" },
                ].map((col) => (
                  <th
                    key={col.label}
                    className={cn(
                      "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500",
                      col.align === "right" ? "text-right" : "text-left"
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const { totalCost, sell, discountPct, finalPrice, profitPerUnit, margin } =
                  calcRow(p);
                const hasPricing = sell > 0 || totalCost > 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{p.stock}</td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {totalCost > 0 ? formatPrice(totalCost) : <Dash />}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {sell > 0 ? formatPrice(sell) : <Dash />}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {discountPct > 0 ? (
                        <span className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                          {discountPct}% off
                        </span>
                      ) : (
                        <Dash />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {hasPricing ? formatPrice(finalPrice) : <Dash />}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-semibold",
                        !hasPricing
                          ? "text-slate-400"
                          : profitPerUnit >= 0
                            ? "text-emerald-600"
                            : "text-red-500"
                      )}
                    >
                      {hasPricing ? formatPrice(profitPerUnit) : <Dash />}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right text-sm font-medium",
                        !hasPricing
                          ? "text-slate-400"
                          : margin >= 0
                            ? "text-emerald-600"
                            : "text-red-500"
                      )}
                    >
                      {hasPricing ? `${margin.toFixed(1)}%` : <Dash />}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit pricing modal */}
      <Modal
        open={editOpen}
        title={`Edit Pricing — ${edit?.productName}`}
        description="Profit and margin update live as you type."
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        {edit && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cost / Bought Price ($)" error={errors.boughtPrice}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={edit.boughtPrice}
                  onChange={(e) => {
                    setEdit((prev) => prev && { ...prev, boughtPrice: e.target.value });
                    setErrors((prev) => ({ ...prev, boughtPrice: "" }));
                  }}
                  placeholder="0.00"
                />
              </Field>
              <Field label="Delivery Cost ($)" error={errors.deliveryPrice}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={edit.deliveryPrice}
                  onChange={(e) => {
                    setEdit((prev) => prev && { ...prev, deliveryPrice: e.target.value });
                    setErrors((prev) => ({ ...prev, deliveryPrice: "" }));
                  }}
                  placeholder="0.00"
                />
              </Field>
              <Field label="Sell Price ($)" error={errors.sellPrice}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={edit.sellPrice}
                  onChange={(e) => {
                    setEdit((prev) => prev && { ...prev, sellPrice: e.target.value });
                    setErrors((prev) => ({ ...prev, sellPrice: "" }));
                  }}
                  placeholder="0.00"
                />
              </Field>
              <Field label="Discount (%)" error={errors.discountPct} hint="0 = no discount">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={edit.discountPct}
                  onChange={(e) => {
                    setEdit((prev) => prev && { ...prev, discountPct: e.target.value });
                    setErrors((prev) => ({ ...prev, discountPct: "" }));
                  }}
                  placeholder="0"
                />
              </Field>
            </div>

            {/* Live preview */}
            <div className="grid grid-cols-4 gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs text-slate-500">Final Price</p>
                <p className="mt-0.5 font-semibold text-slate-900">{formatPrice(previewFinal)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Cost</p>
                <p className="mt-0.5 font-semibold text-slate-900">{formatPrice(previewCost)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Profit / Unit</p>
                <p
                  className={cn(
                    "mt-0.5 font-bold",
                    previewProfit >= 0 ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {formatPrice(previewProfit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Margin</p>
                <p
                  className={cn(
                    "mt-0.5 font-bold",
                    previewMargin >= 0 ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {previewMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Dash() {
  return <span className="text-slate-300">—</span>;
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "green" | "red";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-bold",
          highlight === "green"
            ? "text-emerald-600"
            : highlight === "red"
              ? "text-red-500"
              : "text-slate-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

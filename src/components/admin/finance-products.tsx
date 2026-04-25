"use client";

import { formatPrice, cn } from "@/lib/utils";
import type { ProductRow } from "./finance-manager";

interface Props {
  products: ProductRow[];
}

export function FinanceProducts({ products }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">Product Pricing Overview</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Margin summary across all products. Edit pricing on each product&apos;s page.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100">
            <tr>
              {[
                { label: "Product", align: "left" },
                { label: "Sell Price", align: "right" },
                { label: "Bought Price", align: "right" },
                { label: "Delivery", align: "right" },
                { label: "Discount", align: "right" },
                { label: "Final Price", align: "right" },
                { label: "Profit / Unit", align: "right" },
              ].map((col) => (
                <th
                  key={col.label}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600",
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
              const bought = Number(p.financeData?.boughtPrice ?? 0);
              const delivery = Number(p.financeData?.deliveryPrice ?? 0);
              const sell = Number(p.price);
              const discountPct = Number(p.financeData?.discountPct ?? 0);
              const finalPrice = sell * (1 - discountPct / 100);
              const profit = finalPrice - bought - delivery;
              const hasPricing = sell > 0 || bought > 0;
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{hasPricing ? formatPrice(sell) : <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{bought > 0 ? formatPrice(bought) : <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{delivery > 0 ? formatPrice(delivery) : <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {discountPct > 0 ? `${discountPct}%` : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{hasPricing ? formatPrice(finalPrice) : <span className="text-slate-400">—</span>}</td>
                  <td className={cn("px-4 py-3 text-right font-semibold", !hasPricing ? "text-slate-400" : profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                    {hasPricing ? formatPrice(profit) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

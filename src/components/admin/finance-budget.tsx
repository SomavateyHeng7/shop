"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductRow, SettingsRow, OrderRow } from "./finance-manager";

interface Props {
  settings: SettingsRow;
  products: ProductRow[];
  monthOrders: OrderRow[];
  selectedMonth: string;
}

export function FinanceBudget({ settings, products, monthOrders, selectedMonth }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  // Local state for display — updated immediately on save, not waiting on router.refresh()
  const [liveBudget, setLiveBudget] = useState(settings.investmentBudget);
  const [liveGoal, setLiveGoal] = useState(settings.targetGoal);

  // Form state (edit dialog)
  const [editOpen, setEditOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState(settings.investmentBudget);
  const [goalInput, setGoalInput] = useState(settings.targetGoal);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Monthly actuals from orders in the selected month
  const monthActuals = monthOrders.reduce(
    (acc, o) => {
      for (const item of o.items) {
        const disc = Number(item.sellPrice) * (1 - Number(item.discountPct) / 100);
        acc.revenue += disc * item.quantity;
        acc.cost += (Number(item.boughtPrice) + Number(item.deliveryPrice)) * item.quantity;
      }
      return acc;
    },
    { revenue: 0, cost: 0 }
  );
  const monthProfit = monthActuals.revenue - monthActuals.cost;

  // Stock projections (not time-based)
  const totalInvested = products.reduce((sum, p) => {
    const bought = Number(p.financeData?.boughtPrice ?? 0);
    const delivery = Number(p.financeData?.deliveryPrice ?? 0);
    return sum + (bought + delivery) * p.stock;
  }, 0);

  const budgetNum = Number(liveBudget);
  const goalNum = Number(liveGoal);
  const budgetUsed = budgetNum > 0 ? Math.min((totalInvested / budgetNum) * 100, 100) : 0;
  const goalProgress = goalNum > 0 ? Math.min((monthProfit / goalNum) * 100, 100) : 0;

  const monthLabel = new Date(
    Number(selectedMonth.slice(0, 4)),
    Number(selectedMonth.slice(5, 7)) - 1,
    1
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function openEdit() {
    setBudgetInput(liveBudget);
    setGoalInput(liveGoal);
    setErrors({});
    setEditOpen(true);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (isNaN(Number(budgetInput)) || Number(budgetInput) < 0)
      errs.budget = "Must be a non-negative number";
    if (isNaN(Number(goalInput)) || Number(goalInput) < 0)
      errs.goal = "Must be a non-negative number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function save() {
    if (!validate()) return;
    startTransition(async () => {
      const res = await fetch("/api/admin/finance/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investmentBudget: Number(budgetInput),
          targetGoal: Number(goalInput),
        }),
      });
      if (!res.ok) {
        showToast({ title: "Failed to save settings", variant: "error" });
        return;
      }
      // Update local display immediately — don't wait for router.refresh()
      setLiveBudget(budgetInput);
      setLiveGoal(goalInput);
      showToast({ title: "Settings updated", variant: "success" });
      setEditOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Global settings + monthly actuals */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Budget & Goals</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Global targets · Monthly actuals for {monthLabel}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={openEdit}>
            Edit
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Investment Budget" value={formatPrice(liveBudget)} />
          <StatCard label="Target Profit / Month" value={formatPrice(liveGoal)} />
          <StatCard
            label={`Revenue · ${monthLabel}`}
            value={formatPrice(monthActuals.revenue)}
          />
          <StatCard
            label={`Profit · ${monthLabel}`}
            value={formatPrice(monthProfit)}
            highlight={
              monthOrders.length === 0 ? undefined : monthProfit >= 0 ? "green" : "red"
            }
          />
        </div>

        <div className="mt-5 space-y-3">
          <ProgressBar
            label="Investment Budget Used (stock)"
            percent={budgetUsed}
            detail={`${formatPrice(totalInvested)} / ${formatPrice(budgetNum)}`}
            color="blue"
          />
          <ProgressBar
            label={`Monthly Profit vs Goal · ${monthLabel}`}
            percent={goalProgress}
            detail={`${formatPrice(monthProfit)} / ${formatPrice(goalNum)}`}
            color={monthProfit >= 0 ? "green" : "red"}
          />
        </div>

        {monthOrders.length === 0 && (
          <p className="mt-4 text-center text-xs text-slate-400">
            No orders recorded for {monthLabel}. Add orders in the Orders tab.
          </p>
        )}
      </div>

      {/* Per-product stock value table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Stock Value Summary</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Current stock × cost and sell price per product.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100">
              <tr>
                {["Product", "Stock", "Cost / Unit", "Sell Price", "Total Invested", "Revenue", "Profit"].map(
                  (h) => (
                    <th
                      key={h}
                      className={cn(
                        "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600",
                        h === "Product" ? "text-left" : "text-right"
                      )}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const bought = Number(p.financeData?.boughtPrice ?? 0);
                const delivery = Number(p.financeData?.deliveryPrice ?? 0);
                const sell = Number(p.price);
                const discountPct = Number(p.financeData?.discountPct ?? 0);
                const discounted = sell * (1 - discountPct / 100);
                const invested = (bought + delivery) * p.stock;
                const projected = discounted * p.stock;
                const profit = projected - invested;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{p.stock}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatPrice(bought + delivery)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatPrice(discounted)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatPrice(invested)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatPrice(projected)}</td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-medium",
                        profit >= 0 ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {formatPrice(profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit dialog */}
      <Modal
        open={editOpen}
        title="Edit Budget & Goals"
        description="These are global targets used across all months."
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
        <div className="space-y-4">
          <Field label="Investment Budget ($)" error={errors.budget}>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={budgetInput}
              onChange={(e) => {
                setBudgetInput(e.target.value);
                setErrors((prev) => ({ ...prev, budget: "" }));
              }}
              placeholder="0.00"
            />
          </Field>
          <Field
            label="Target Profit / Month ($)"
            error={errors.goal}
            hint="The goal progress bar compares this month's actual profit against this target."
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              value={goalInput}
              onChange={(e) => {
                setGoalInput(e.target.value);
                setErrors((prev) => ({ ...prev, goal: "" }));
              }}
              placeholder="0.00"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
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
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-bold",
          highlight === "green"
            ? "text-emerald-600"
            : highlight === "red"
              ? "text-red-600"
              : "text-slate-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ProgressBar({
  label,
  percent,
  detail,
  color,
}: {
  label: string;
  percent: number;
  detail: string;
  color: "blue" | "green" | "red";
}) {
  const barColor =
    color === "blue" ? "bg-blue-500" : color === "green" ? "bg-emerald-500" : "bg-red-400";
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs text-slate-600">
        <span className="font-medium">{label}</span>
        <span>
          {detail} · {Math.round(percent)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${Math.max(0, percent)}%` }}
        />
      </div>
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

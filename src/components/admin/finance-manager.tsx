"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FinanceBudget } from "./finance-budget";
import { FinanceProducts } from "./finance-products";
import { FinanceOrders } from "./finance-orders";

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

export interface SettingsRow {
  id: string;
  investmentBudget: string;
  targetGoal: string;
}

export interface OrderItemRow {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  boughtPrice: string;
  deliveryPrice: string;
  sellPrice: string;
  discountPct: string;
}

export interface OrderRow {
  id: string;
  orderId: string;
  note: string | null;
  createdAt: string;
  items: OrderItemRow[];
}

type Tab = "budget" | "products" | "orders";

const TABS: { key: Tab; label: string }[] = [
  { key: "budget", label: "Budget & Goals" },
  { key: "products", label: "Product Pricing" },
  { key: "orders", label: "Orders" },
];

function todayMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

interface Props {
  initialProducts: ProductRow[];
  initialSettings: SettingsRow;
  initialOrders: OrderRow[];
}

export function FinanceManager({ initialProducts, initialSettings, initialOrders }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("budget");
  const [selectedMonth, setSelectedMonth] = useState(todayMonth);

  const filteredOrders = initialOrders.filter(
    (o) => o.createdAt.slice(0, 7) === selectedMonth
  );

  return (
    <div className="space-y-4">
      {/* Tab bar + month picker */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-1 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition",
                activeTab === tab.key
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Viewing</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-accent-600"
          />
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {formatMonthLabel(selectedMonth)}
          </span>
        </div>
      </div>

      {activeTab === "budget" && (
        <FinanceBudget
          settings={initialSettings}
          products={initialProducts}
          monthOrders={filteredOrders}
          selectedMonth={selectedMonth}
        />
      )}
      {activeTab === "products" && <FinanceProducts products={initialProducts} />}
      {activeTab === "orders" && (
        <FinanceOrders orders={initialOrders} products={initialProducts} />
      )}
    </div>
  );
}

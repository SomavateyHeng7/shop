"use client";

import { useState } from "react";

function today() {
  return new Date().toISOString().split("T")[0];
}
function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function download(url: string) {
  window.open(url, "_blank");
}

export default function ExportPage() {
  // Stock log range
  const [stockFrom, setStockFrom] = useState(firstOfMonth());
  const [stockTo, setStockTo] = useState(today());

  // Finance month
  const [financeMonth, setFinanceMonth] = useState(currentMonth());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Export</h1>
        <p className="mt-1 text-sm text-slate-500">Download your data as CSV files for reporting or analysis.</p>
      </div>

      {/* Inventory Snapshot */}
      <ExportCard
        title="Inventory Snapshot"
        description="All active products — name, category, current stock, sell price, bought price, delivery cost, margin."
        badge="Instant"
      >
        <button
          onClick={() => download("/api/admin/export")}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          Download CSV
        </button>
      </ExportCard>

      {/* Stock Movement Log */}
      <ExportCard
        title="Stock Movement Log"
        description="Every stock change — sales (auto-deducted by orders), restocks with unit cost, and manual adjustments. Includes the weighted average cost calculation trail."
        badge="Date range"
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">From</span>
            <input
              type="date"
              value={stockFrom}
              onChange={(e) => setStockFrom(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">To</span>
            <input
              type="date"
              value={stockTo}
              onChange={(e) => setStockTo(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
            />
          </label>
          <button
            onClick={() => download(`/api/admin/export/stock-log?from=${stockFrom}&to=${stockTo}`)}
            className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-black"
          >
            Download CSV
          </button>
          <button
            onClick={() => download("/api/admin/export/stock-log")}
            className="h-9 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            All time
          </button>
        </div>
      </ExportCard>

      {/* Finance / Orders */}
      <ExportCard
        title="Finance & Orders"
        description="Order line items with sell price, discount, revenue, cost (bought + delivery), and profit per unit. Includes totals row."
        badge="Monthly"
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Month</span>
            <input
              type="month"
              value={financeMonth}
              onChange={(e) => setFinanceMonth(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 px-3 text-sm text-slate-900"
            />
          </label>
          <button
            onClick={() => download(`/api/admin/finance/export?month=${financeMonth}`)}
            className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-black"
          >
            Download CSV
          </button>
          <button
            onClick={() => download("/api/admin/finance/export")}
            className="h-9 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            All time
          </button>
        </div>
      </ExportCard>
    </div>
  );
}

function ExportCard({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
              {badge}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

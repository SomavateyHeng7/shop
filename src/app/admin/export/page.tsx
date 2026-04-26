"use client";

export default function ExportPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Export</h1>
      <p className="mb-6 text-sm text-slate-500">Download your data as CSV files.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Inventory */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Inventory</h2>
            <p className="mt-1 text-sm text-slate-500">
              All active products with name, category, sell price, stock level, and low-stock
              threshold.
            </p>
          </div>
          <ul className="mb-5 space-y-1.5 text-xs text-slate-500">
            {[
              "Product ID & Name",
              "Category",
              "Sell Price",
              "Stock & Low-Stock Threshold",
              "Active Status",
              "Created Date",
            ].map((col) => (
              <li key={col} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                {col}
              </li>
            ))}
          </ul>
          <button
            onClick={() => window.open("/api/admin/export", "_blank")}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Download Inventory CSV
          </button>
        </div>

        {/* Finance */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Finance</h2>
            <p className="mt-1 text-sm text-slate-500">
              Full pricing breakdown per product — cost, delivery, discount, profit per unit,
              margin, and stock totals.
            </p>
          </div>
          <ul className="mb-5 space-y-1.5 text-xs text-slate-500">
            {[
              "Cost & Delivery per Unit",
              "Sell Price & Discount %",
              "Final Price after Discount",
              "Profit per Unit & Margin %",
              "Total Invested (cost × stock)",
              "Potential Revenue & Profit",
            ].map((col) => (
              <li key={col} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                {col}
              </li>
            ))}
          </ul>
          <button
            onClick={() => window.open("/api/admin/finance/export", "_blank")}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Download Finance CSV
          </button>
        </div>
      </div>
    </div>
  );
}

"use client"

import { useMemo, useState } from "react"
import type { FinanceTab, Order } from "@/components/finance"
import {
  expenses,
  goal,
  orders,
  products,
  FinanceTabs,
  ReceiptModal,
  OverviewSection,
  ProductsSection,
  OrdersSection,
  ReceiptsSection,
  ExpensesSection,
  ReportsSection,
  ExportsSection,
  SettingsSection,
  downloadCsv,
  getFinanceSummary,
} from "@/components/finance"

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("overview")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const finance = useMemo(() => {
    return getFinanceSummary({
      products,
      orders,
      expenses,
      goal,
    })
  }, [])

  const reportRows = [
    {
      Month: "April 2026",
      TotalOrders: finance.totalOrders,
      TotalRevenue: finance.totalRevenue,
      GrossProfit: finance.grossProfit,
      TotalExpenses: finance.totalExpenses,
      NetProfit: finance.netProfit,
      ProfitMargin: finance.profitMargin.toFixed(1),
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Finance</h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor budget, products, orders, expenses, profit, receipts, and monthly reports.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadCsv("monthly-report.csv", reportRows)}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Export Monthly Report
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Print Report
            </button>
          </div>
        </div>

        <FinanceTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "overview" ? (
          <OverviewSection products={products} finance={finance} goal={goal} />
        ) : null}

        {activeTab === "products" ? <ProductsSection products={products} /> : null}

        {activeTab === "orders" ? (
          <OrdersSection orders={orders} onViewReceipt={setSelectedOrder} />
        ) : null}

        {activeTab === "receipts" ? (
          <ReceiptsSection orders={orders} onViewReceipt={setSelectedOrder} />
        ) : null}

        {activeTab === "expenses" ? <ExpensesSection expenses={expenses} /> : null}

        {activeTab === "reports" ? (
          <ReportsSection finance={finance} orders={orders} products={products} />
        ) : null}

        {activeTab === "exports" ? (
          <ExportsSection finance={finance} orders={orders} products={products} />
        ) : null}

        {activeTab === "settings" ? <SettingsSection goal={goal} /> : null}

        {selectedOrder ? (
          <ReceiptModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        ) : null}
      </div>
    </main>
  )
}
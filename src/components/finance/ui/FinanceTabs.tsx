import type { FinanceTab } from "../model/types"

const tabs: Array<{ id: FinanceTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "receipts", label: "Receipts" },
  { id: "expenses", label: "Expenses" },
  { id: "reports", label: "Reports" },
  { id: "exports", label: "Exports" },
  { id: "settings", label: "Settings" },
]

export function FinanceTabs({
  activeTab,
  onChange,
}: {
  activeTab: FinanceTab
  onChange: (tab: FinanceTab) => void
}) {
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="inline-flex min-w-full gap-2 rounded-2xl border border-slate-200 bg-white p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

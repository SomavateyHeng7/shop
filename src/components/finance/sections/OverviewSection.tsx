import type { FinanceSummary, Product } from "../model/types"
import { FinanceCard } from "../ui/FinanceCard"
import { Section } from "../ui/Section"
import { money } from "../lib/utils"

export function OverviewSection({
  products,
  finance,
  goal,
}: {
  products: Product[]
  finance: FinanceSummary
  goal: number
}) {
  const progress = goal > 0 ? Math.min((finance.netProfit / goal) * 100, 100) : 0
  const lowStock = products.filter((product) => product.stock <= 20).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FinanceCard title="Total Revenue" value={money(finance.totalRevenue)} />
        <FinanceCard title="Gross Profit" value={money(finance.grossProfit)} tone="success" />
        <FinanceCard title="Net Profit" value={money(finance.netProfit)} tone="success" />
        <FinanceCard title="Low Stock Products" value={String(lowStock)} tone="warning" />
      </div>

      <Section title="Profit Goal" description="Track this month progress to your target profit.">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Target</span>
          <span className="font-semibold text-slate-950">{money(goal)}</span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
        </div>

        <p className="mt-3 text-sm text-slate-600">{progress.toFixed(1)}% reached</p>
      </Section>
    </div>
  )
}

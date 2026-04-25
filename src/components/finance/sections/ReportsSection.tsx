import type { FinanceSummary, Order, Product } from "../model/types"
import { FinanceCard } from "../ui/FinanceCard"
import { Section } from "../ui/Section"
import { money, orderTotals, productProfit } from "../lib/utils"

type ReportsSectionProps = {
  finance: FinanceSummary
  orders: Order[]
  products: Product[]
}

export function ReportsSection({ finance, orders, products }: ReportsSectionProps) {
  const topProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FinanceCard title="Monthly Orders" value={String(finance.totalOrders)} />
        <FinanceCard title="Monthly Revenue" value={money(finance.totalRevenue)} />
        <FinanceCard title="Monthly Gross Profit" value={money(finance.grossProfit)} tone="success" />
        <FinanceCard title="Monthly Net Profit" value={money(finance.netProfit)} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Monthly Summary">
          <div className="space-y-3 text-sm">
            <SummaryRow label="Total Orders" value={String(finance.totalOrders)} />
            <SummaryRow label="Total Revenue" value={money(finance.totalRevenue)} />
            <SummaryRow
              label="Total Product Cost"
              value={money(orders.reduce((sum, order) => sum + orderTotals(order).productCost, 0))}
            />
            <SummaryRow
              label="Total Delivery Cost"
              value={money(orders.reduce((sum, order) => sum + orderTotals(order).deliveryCost, 0))}
            />
            <SummaryRow
              label="Total Discounts"
              value={money(orders.reduce((sum, order) => sum + orderTotals(order).discount, 0))}
            />
            <SummaryRow label="Total Expenses" value={money(finance.totalExpenses)} />

            <div className="flex justify-between border-t border-slate-200 pt-3">
              <span className="font-semibold text-slate-950">Net Profit</span>
              <span className="font-semibold text-emerald-700">{money(finance.netProfit)}</span>
            </div>
          </div>
        </Section>

        <Section title="Top Selling Products">
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <p className="font-medium text-slate-950">{product.name}</p>
                  <p className="text-sm text-slate-500">{product.sku}</p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-950">{product.sold} sold</p>
                  <p className="text-sm text-emerald-700">{money(productProfit(product))} profit each</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-950">{value}</span>
    </div>
  )
}
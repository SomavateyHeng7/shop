import type { Order } from "../model/types"
import { StatusBadge } from "../ui/StatusBadge"
import { Section } from "../ui/Section"
import { money, orderTotals } from "../lib/utils"

export function OrdersSection({
  orders,
  onViewReceipt,
}: {
  orders: Order[]
  onViewReceipt: (order: Order) => void
}) {
  return (
    <Section title="Order Profitability" description="Inspect order-level revenue, costs, and profit.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-3 pr-4">Order</th>
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Payment</th>
              <th className="py-3 pr-4">Revenue</th>
              <th className="py-3 pr-4">Total Cost</th>
              <th className="py-3 pr-4">Profit</th>
              <th className="py-3 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const totals = orderTotals(order)

              return (
                <tr key={order.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-medium text-slate-950">{order.orderId}</td>
                  <td className="py-3 pr-4 text-slate-600">{order.customer}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge value={order.status} />
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge value={order.paymentStatus} />
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{money(totals.revenue)}</td>
                  <td className="py-3 pr-4 text-slate-700">{money(totals.totalCost)}</td>
                  <td className="py-3 pr-4 font-medium text-emerald-700">{money(totals.profit)}</td>
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => onViewReceipt(order)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View receipt
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

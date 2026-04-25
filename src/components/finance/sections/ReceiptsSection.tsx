import type { Order } from "../model/types"
import { Section } from "../ui/Section"
import { StatusBadge } from "../ui/StatusBadge"
import { money, orderTotals } from "../lib/utils"

type ReceiptsSectionProps = {
  orders: Order[]
  onViewReceipt: (order: Order) => void
}

export function ReceiptsSection({ orders, onViewReceipt }: ReceiptsSectionProps) {
  return (
    <Section title="Receipts" description="Open, print, or download receipts for each order.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => {
          const totals = orderTotals(order)

          return (
            <div key={order.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">{order.orderId}</p>
                  <p className="text-sm text-slate-500">{order.customer}</p>
                </div>

                <StatusBadge value={order.paymentStatus} />
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-950">{order.orderDate}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Total</span>
                  <span className="font-medium text-slate-950">{money(totals.revenue)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Profit</span>
                  <span className="font-medium text-emerald-700">{money(totals.profit)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onViewReceipt(order)}
                className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Open Receipt
              </button>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
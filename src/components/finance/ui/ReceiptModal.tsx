import type { Order } from "../model/types"
import { money, orderTotals } from "../lib/utils"

export function ReceiptModal({
  order,
  onClose,
}: {
  order: Order
  onClose: () => void
}) {
  const totals = orderTotals(order)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">Receipt {order.orderId}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {order.customer} • {order.orderDate}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {order.items.map((item) => {
            const lineRevenue = (item.unitPrice * (1 - item.discountPercentage / 100)) * item.quantity

            return (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="font-medium text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.quantity} × {money(item.unitPrice)} ({item.discountPercentage}% off)
                  </p>
                </div>
                <p className="font-semibold text-slate-950">{money(lineRevenue)}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          <Row label="Subtotal" value={money(totals.revenue + totals.discount)} />
          <Row label="Discount" value={`-${money(totals.discount)}`} />
          <Row label="Shipping Cost" value={money(totals.deliveryCost)} />
          <Row label="Total" value={money(totals.revenue)} strong />
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className={strong ? "font-semibold text-slate-950" : "font-medium text-slate-900"}>{value}</span>
    </div>
  )
}

import type { OrderStatus, PaymentStatus } from "../model/types"

type BadgeValue = OrderStatus | PaymentStatus

const styles: Record<BadgeValue, string> = {
  pending: "bg-amber-50 text-amber-800",
  processing: "bg-sky-50 text-sky-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
  paid: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700",
  refunded: "bg-slate-200 text-slate-700",
}

export function StatusBadge({ value }: { value: BadgeValue }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[value]}`}>
      {value}
    </span>
  )
}

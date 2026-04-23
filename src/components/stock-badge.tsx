import { getStockStatus } from "@/lib/utils";

interface Props {
  stock: number;
  lowStockAt: number;
}

const labels = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
} as const;

const styles = {
  in_stock: "bg-emerald-100 text-emerald-800",
  low_stock: "bg-amber-100 text-amber-800",
  out_of_stock: "bg-red-100 text-red-800",
} as const;

export function StockBadge({ stock, lowStockAt }: Props) {
  const status = getStockStatus(stock, lowStockAt);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

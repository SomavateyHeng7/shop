import { getStockStatus } from "@/lib/utils";

interface Props {
  stock: number;
  lowStockAt: number;
  preOrder?: boolean;
}

const labels = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  pre_order: "Pre-Order",
} as const;

const styles = {
  in_stock: "bg-emerald-100 text-emerald-800",
  low_stock: "bg-amber-100 text-amber-800",
  out_of_stock: "bg-red-100 text-red-800",
  pre_order: "bg-[#ede5f7] text-[#4a3860]",
} as const;

export function StockBadge({ stock, lowStockAt, preOrder = false }: Props) {
  const status = getStockStatus(stock, lowStockAt, preOrder);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

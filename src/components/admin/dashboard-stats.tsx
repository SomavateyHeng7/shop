import { formatPrice } from "@/lib/utils";

interface Props {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCategories: number;
}

export function DashboardStats({
  totalProducts,
  totalStockValue,
  lowStockCount,
  outOfStockCount,
  totalCategories,
}: Props) {
  const cards = [
    { label: "Active Products", value: totalProducts.toString() },
    { label: "Inventory Value", value: formatPrice(totalStockValue) },
    { label: "Low Stock", value: lowStockCount.toString() },
    { label: "Out of Stock", value: outOfStockCount.toString() },
    { label: "Categories", value: totalCategories.toString() },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {card.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
        </article>
      ))}
    </section>
  );
}

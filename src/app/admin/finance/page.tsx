import { prisma } from "@/lib/prisma";
import { FinanceProducts } from "@/components/admin/finance-products";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { financeData: true },
    orderBy: { name: "asc" },
  });

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price.toString(),
    stock: p.stock,
    financeData: p.financeData
      ? {
          id: p.financeData.id,
          boughtPrice: p.financeData.boughtPrice.toString(),
          deliveryPrice: p.financeData.deliveryPrice.toString(),
          discountPct: p.financeData.discountPct.toString(),
        }
      : null,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Finance</h1>
      <FinanceProducts products={rows} />
    </div>
  );
}

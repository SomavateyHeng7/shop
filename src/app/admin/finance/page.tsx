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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Finance</h1>
        <p className="mt-1 text-sm text-slate-500">Manage pricing and export reports from one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="/api/admin/export"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
        >
          <h2 className="text-base font-semibold text-slate-900">Inventory Export</h2>
          <p className="mt-1 text-sm text-slate-500">Download active products, category, stock, and thresholds as CSV.</p>
          <span className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Download Inventory CSV</span>
        </a>

        <a
          href="/api/admin/finance/export"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
        >
          <h2 className="text-base font-semibold text-slate-900">Finance Export</h2>
          <p className="mt-1 text-sm text-slate-500">Download cost, discount, margin, and profit breakdown as CSV.</p>
          <span className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Download Finance CSV</span>
        </a>
      </div>

      <FinanceProducts products={rows} />
    </div>
  );
}

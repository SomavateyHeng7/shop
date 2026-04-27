import Link from "next/link";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { mockStore } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const allProducts = mockStore.products.findMany({ activeOnly: true });

  const totalProducts = allProducts.length;
  const totalStockValue = allProducts.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );
  const lowStockCount = allProducts.filter(
    (product) => product.stock > 0 && product.stock <= product.lowStockAt
  ).length;
  const outOfStockCount = allProducts.filter((product) => product.stock === 0).length;
  const categories = mockStore.categories.count();

  const lowStockAlerts = allProducts
    .filter((product) => product.stock > 0 && product.stock <= product.lowStockAt)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10);

  const outOfStockProducts = allProducts
    .filter((product) => product.stock === 0)
    .slice(0, 6);

  const highestStockProducts = allProducts
    .slice()
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  const activeInventoryCount = allProducts.reduce(
    (sum, product) => sum + product.stock,
    0
  );

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const lastUpdated = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:p-8">
          <div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
              Admin dashboard
            </div>

            <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Inventory overview
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Track product health, stock risk, and inventory value from one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/products/new"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Add product
              </Link>

              <Link
                href="/admin/products"
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View products
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
            <p className="text-sm font-medium text-slate-300">Stock value</p>
            <p className="mt-3 text-3xl font-semibold">
              {currency.format(totalStockValue)}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-slate-300">Units</p>
                <p className="mt-1 text-xl font-semibold">{activeInventoryCount}</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-slate-300">Updated</p>
                <p className="mt-1 text-sm font-semibold">{lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DashboardStats
        totalProducts={totalProducts}
        totalStockValue={totalStockValue}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        totalCategories={categories}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Low stock alerts
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Products that need restocking soon.
              </p>
            </div>

            <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {lowStockCount} active alerts
            </span>
          </div>

          <div className="p-5">
            {lowStockAlerts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No low-stock products right now.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Your active inventory is above all configured thresholds.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockAlerts.map((product) => {
                  const percentage = Math.min(
                    Math.round((product.stock / product.lowStockAt) * 100),
                    100
                  );

                  return (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-medium text-slate-950">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {product.stock} left, threshold {product.lowStockAt}
                          </p>
                        </div>

                        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
                          Restock soon
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Inventory health
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Current product risk summary.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">Active products</span>
                  <span className="font-semibold text-slate-950">
                    {totalProducts}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-amber-800">Low stock</span>
                  <span className="font-semibold text-amber-900">
                    {lowStockCount}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-red-700">Out of stock</span>
                  <span className="font-semibold text-red-800">
                    {outOfStockCount}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Highest stock
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Products with the most available units.
            </p>

            <div className="mt-5 space-y-3">
              {highestStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-950">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {currency.format(product.price)} each
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    {product.stock}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Out of stock
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Products that need immediate action.
            </p>

            <div className="mt-5 space-y-3">
              {outOfStockProducts.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  No active products are out of stock.
                </p>
              ) : (
                outOfStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-red-50 px-4 py-3"
                  >
                    <p className="truncate text-sm font-medium text-red-900">
                      {product.name}
                    </p>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700 shadow-sm">
                      0 left
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

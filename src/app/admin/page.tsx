import { DashboardStats } from "@/components/admin/dashboard-stats";
import { mockStore } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const allProducts = mockStore.products.findMany({ activeOnly: true });

  const totalProducts = allProducts.length;
  const totalStockValue = allProducts.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = allProducts.filter((p) => p.stock > 0 && p.stock <= p.lowStockAt).length;
  const outOfStockCount = allProducts.filter((p) => p.stock === 0).length;
  const categories = mockStore.categories.count();

  const lowStockAlerts = allProducts
    .filter((p) => p.stock > 0 && p.stock <= p.lowStockAt)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-slate-600">
          Monitor total inventory value and act quickly on low-stock products.
        </p>
      </section>

      <DashboardStats
        totalProducts={totalProducts}
        totalStockValue={totalStockValue}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        totalCategories={categories}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Low Stock Alerts</h2>
        <div className="mt-3 space-y-2">
          {lowStockAlerts.length === 0 && (
            <p className="text-sm text-slate-500">No low-stock products right now.</p>
          )}
          {lowStockAlerts.map((product) => (
            <div key={product.id} className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {product.name}: {product.stock} left (threshold {product.lowStockAt})
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { StockEditor } from "@/components/admin/stock-editor";
import { VariantManager } from "@/components/admin/variant-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        financeData: true,
        stockLogs: { orderBy: { createdAt: "desc" }, take: 20 },
        variants: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const serialized = { ...product, price: product.price.toNumber(), financeData: undefined, stockLogs: undefined, variants: undefined };

  const financeData = product.financeData
    ? {
        boughtPrice: product.financeData.boughtPrice.toString(),
        deliveryPrice: product.financeData.deliveryPrice.toString(),
        discountPct: product.financeData.discountPct.toString(),
      }
    : null;

  const stockLogs = product.stockLogs.map((log) => ({
    id: log.id,
    change: log.change,
    note: log.note,
    unitCost: log.unitCost ? Number(log.unitCost) : null,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">Edit Product</h1>
      <ProductForm mode="edit" categories={categories} product={serialized} financeData={financeData} />

      {/* Variants */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">Variants</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Add colours, sizes, or any options — each with its own image. Customers will see these as swatches on the product page.
          </p>
        </div>
        <VariantManager
          productId={product.id}
          initialVariants={product.variants.map((v) => ({
            id: v.id,
            label: v.label,
            imageUrl: v.imageUrl,
            stock: v.stock,
            sortOrder: v.sortOrder,
          }))}
        />
      </div>

      {/* Restock */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">Add Stock</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {product.variants.length > 0
              ? "This product uses variants — manage stock per variant above. The total shown here is the sum of all variant quantities."
              : "Enter the quantity received and the unit cost you paid — this updates the weighted average cost automatically."}
          </p>
        </div>
        {product.variants.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900">{product.stock} total</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">managed via variants</span>
          </div>
        ) : (
          <StockEditor id={product.id} initialStock={product.stock} />
        )}
      </div>

      {/* Stock history */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Stock History</h2>
          <p className="mt-0.5 text-sm text-slate-500">Last 20 movements — sales, restocks, and adjustments.</p>
        </div>
        {stockLogs.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-400">No stock movements yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stockLogs.map((log) => {
              const isOrder = log.note?.startsWith("Order");
              const isRestock = log.change > 0;
              return (
                <div key={log.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold
                      ${isOrder ? "bg-red-100 text-red-600" : isRestock ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>
                      {log.change > 0 ? "+" : ""}
                      {log.change}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {log.note ?? (isRestock ? "Restock" : "Adjustment")}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "numeric", minute: "2-digit",
                        })}
                        {log.unitCost != null && (
                          <span className="ml-2 font-medium text-slate-500">
                            @ ${log.unitCost.toFixed(2)}/unit
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold
                    ${isOrder ? "bg-red-50 text-red-600" : isRestock ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {isOrder ? "Sale" : isRestock ? "Restock" : "Adjustment"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

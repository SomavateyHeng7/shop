import Link from "next/link";
import { ArchiveButton } from "@/components/admin/archive-button";
import { ProductCardData } from "@/lib/catalog";
import { formatPrice, getStockStatus } from "@/lib/utils";
import { StockEditor } from "@/components/admin/stock-editor";

interface Props {
  products: ProductCardData[];
}

export function ProductTable({ products }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => {
            const status = getStockStatus(product.stock, product.lowStockAt);
            const rowTone =
              status === "out_of_stock"
                ? "bg-red-50"
                : status === "low_stock"
                  ? "bg-amber-50"
                  : "bg-emerald-50";

            return (
              <tr key={product.id} className={rowTone}>
                <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                <td className="px-4 py-3 text-slate-600">{product.category?.name ?? "Uncategorized"}</td>
                <td className="px-4 py-3 text-slate-700">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">
                  <StockEditor id={product.id} initialStock={product.stock} />
                </td>
                <td className="px-4 py-3 capitalize text-slate-700">
                  {status.replaceAll("_", " ")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white"
                    >
                      Edit
                    </Link>
                    <ArchiveButton id={product.id} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

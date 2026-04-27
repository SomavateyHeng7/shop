import Link from "next/link"
import { ArchiveButton } from "@/components/admin/archive-button"
import { StockEditor } from "@/components/admin/stock-editor"
import { ProductCardData } from "@/lib/catalog"
import { formatPrice, getStockStatus } from "@/lib/utils"

type AdminProductRow = ProductCardData & { isActive: boolean };

interface Props {
  products: AdminProductRow[];
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
            const status = getStockStatus(product.stock, product.lowStockAt, product.preOrder);
            const rowTone =
              !product.isActive
                ? "bg-slate-50 opacity-60"
                : status === "out_of_stock"
                  ? "bg-red-50"
                  : status === "pre_order"
                    ? "bg-purple-50"
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
                      title="Edit product"
                      className="rounded-md border border-slate-300 p-1.5 text-slate-700 hover:bg-white inline-flex items-center"
                    >
<<<<<<< HEAD
                      {styles.label}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/products/${product.id}`}
                        title="Edit product"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </Link>
                      <ArchiveButton id={product.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {products.map((product) => {
          const status = getStockStatus(product.stock, product.lowStockAt)
          const styles = statusStyles[status]

          return (
            <article
              key={product.id}
              className={`rounded-2xl border border-slate-200 border-l-4 ${styles.border} bg-white p-4 shadow-sm`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="block truncate font-semibold text-slate-950"
                  >
                    {product.name}
                  </Link>

                  <p className="mt-1 text-sm text-slate-500">
                    {product.category?.name ?? "Uncategorized"}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles.badge}`}
                >
                  {styles.label}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Price</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatPrice(product.price)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Low stock at</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {product.lowStockAt}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-slate-500">Stock</p>
                <StockEditor id={product.id} initialStock={product.stock} />
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                  Edit
                </Link>
                <ArchiveButton id={product.id} />
              </div>
            </article>
          )
        })}
      </div>
=======
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </Link>
                    <ArchiveButton id={product.id} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
>>>>>>> feat/finance
    </div>
  )
}

import type { Product } from "../model/types"
import { Section } from "../ui/Section"
import { finalPrice, money, productProfit, productTotalCost } from "../lib/utils"

export function ProductsSection({ products }: { products: Product[] }) {
  return (
    <Section title="Product Finance" description="Track costing, selling price, discount, and per-item profit.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-3 pr-4">Product</th>
              <th className="py-3 pr-4">SKU</th>
              <th className="py-3 pr-4">Total Cost</th>
              <th className="py-3 pr-4">Sell Price</th>
              <th className="py-3 pr-4">Final Price</th>
              <th className="py-3 pr-4">Profit / Item</th>
              <th className="py-3 pr-4">Stock</th>
              <th className="py-3 pr-4">Sold</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-950">{product.name}</td>
                <td className="py-3 pr-4 text-slate-600">{product.sku}</td>
                <td className="py-3 pr-4 text-slate-700">{money(productTotalCost(product))}</td>
                <td className="py-3 pr-4 text-slate-700">{money(product.sellPrice)}</td>
                <td className="py-3 pr-4 text-slate-700">
                  {money(finalPrice(product.sellPrice, product.discountPercentage))}
                </td>
                <td className="py-3 pr-4 font-medium text-emerald-700">{money(productProfit(product))}</td>
                <td className="py-3 pr-4 text-slate-600">{product.stock}</td>
                <td className="py-3 pr-4 text-slate-600">{product.sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

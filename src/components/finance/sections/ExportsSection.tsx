import type { FinanceSummary, Order, Product } from "../model/types"
import { Section } from "../ui/Section"
import {
  downloadCsv,
  finalPrice,
  orderTotals,
  productProfit,
  productTotalCost,
  profitMargin,
} from "../lib/utils"

type ExportsSectionProps = {
  finance: FinanceSummary
  orders: Order[]
  products: Product[]
}

export function ExportsSection({ finance, orders, products }: ExportsSectionProps) {
  const productRows = products.map((product) => {
    const totalCost = productTotalCost(product)
    const sellAfterDiscount = finalPrice(product.sellPrice, product.discountPercentage)
    const profit = productProfit(product)

    return {
      SKU: product.sku,
      Product: product.name,
      Category: product.category,
      BoughtPrice: product.boughtPrice,
      DeliveryCost: product.deliveryCost,
      ExtraCost: product.extraCost,
      TotalCost: totalCost,
      SellPrice: product.sellPrice,
      DiscountPercent: product.discountPercentage,
      FinalPrice: sellAfterDiscount,
      ProfitPerItem: profit,
      ProfitMargin: profitMargin(profit, sellAfterDiscount).toFixed(1),
      Stock: product.stock,
      Sold: product.sold,
    }
  })

  const orderRows = orders.map((order) => {
    const totals = orderTotals(order)

    return {
      OrderId: order.orderId,
      Customer: order.customer,
      Date: order.orderDate,
      Status: order.status,
      PaymentStatus: order.paymentStatus,
      Revenue: totals.revenue,
      Cost: totals.totalCost,
      Profit: totals.profit,
      ProfitMargin: totals.margin.toFixed(1),
    }
  })

  const reportRows = [
    {
      Month: "April 2026",
      TotalOrders: finance.totalOrders,
      TotalRevenue: finance.totalRevenue,
      GrossProfit: finance.grossProfit,
      TotalExpenses: finance.totalExpenses,
      NetProfit: finance.netProfit,
      ProfitMargin: finance.profitMargin.toFixed(1),
    },
  ]

  return (
    <Section title="Export Finance Data" description="Export monthly profit, orders, products, or print the report as PDF.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ExportButton
          title="Monthly Report CSV"
          description="Revenue, gross profit, expenses, and net profit."
          onClick={() => downloadCsv("monthly-report.csv", reportRows)}
        />

        <ExportButton
          title="Orders CSV"
          description="Order revenue, cost, profit, and status."
          onClick={() => downloadCsv("orders.csv", orderRows)}
        />

        <ExportButton
          title="Products CSV"
          description="Product costing, stock, discount, and margin."
          onClick={() => downloadCsv("products.csv", productRows)}
        />

        <ExportButton
          title="PDF Report"
          description="Use browser print to save as PDF."
          onClick={() => window.print()}
        />
      </div>
    </Section>
  )
}

function ExportButton({
  title,
  description,
  onClick,
}: {
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-5 text-left hover:bg-slate-50"
    >
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </button>
  )
}
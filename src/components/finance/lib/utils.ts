import type { Expense, FinanceSummary, Order, Product } from "../model/types"

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function money(value: number) {
  return USD.format(value)
}

export function finalPrice(sellPrice: number, discountPercentage: number) {
  return sellPrice * (1 - discountPercentage / 100)
}

export function productTotalCost(product: Product) {
  return product.boughtPrice + product.deliveryCost + product.extraCost
}

export function productProfit(product: Product) {
  return finalPrice(product.sellPrice, product.discountPercentage) - productTotalCost(product)
}

export function profitMargin(profit: number, revenue: number) {
  if (revenue === 0) {
    return 0
  }
  return (profit / revenue) * 100
}

export function orderTotals(order: Order) {
  const productCost = order.items.reduce((sum, item) => sum + item.unitCost * item.quantity, 0)
  const deliveryCost = order.items.reduce((sum, item) => sum + item.shippingCost, 0)
  const grossBeforeDiscount = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const revenue = order.items.reduce(
    (sum, item) => sum + finalPrice(item.unitPrice, item.discountPercentage) * item.quantity,
    0
  )
  const discount = grossBeforeDiscount - revenue
  const totalCost = productCost + deliveryCost
  const profit = revenue - totalCost

  return {
    productCost,
    deliveryCost,
    discount,
    revenue,
    totalCost,
    profit,
    margin: profitMargin(profit, revenue),
  }
}

export function getFinanceSummary({
  products,
  orders,
  expenses,
  goal,
}: {
  products: Product[]
  orders: Order[]
  expenses: Expense[]
  goal: number
}): FinanceSummary {
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + orderTotals(order).revenue, 0)
  const grossProfit = orders.reduce((sum, order) => sum + orderTotals(order).profit, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = grossProfit - totalExpenses
  const totalStockValue = products.reduce(
    (sum, product) => sum + productTotalCost(product) * product.stock,
    0
  )

  return {
    totalOrders,
    totalRevenue,
    grossProfit,
    totalExpenses,
    netProfit,
    profitMargin: profitMargin(netProfit, totalRevenue),
    totalProducts: products.length,
    totalStockValue,
    targetProfit: goal,
  }
}

export function downloadCsv(fileName: string, rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) {
    return
  }

  const headers = Object.keys(rows[0])
  const csvBody = rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")).join("\n")
  const csv = `${headers.join(",")}\n${csvBody}`

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

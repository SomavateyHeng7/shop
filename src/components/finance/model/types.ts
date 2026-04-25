export type FinanceTab =
  | "overview"
  | "products"
  | "orders"
  | "receipts"
  | "expenses"
  | "reports"
  | "exports"
  | "settings"

export type Product = {
  id: string
  sku: string
  name: string
  category: string
  boughtPrice: number
  deliveryCost: number
  extraCost: number
  sellPrice: number
  discountPercentage: number
  stock: number
  sold: number
}

export type OrderItem = {
  id: string
  productId: string
  name: string
  quantity: number
  unitCost: number
  unitPrice: number
  discountPercentage: number
  shippingCost: number
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded"

export type Order = {
  id: string
  orderId: string
  customer: string
  orderDate: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  items: OrderItem[]
}

export type Expense = {
  id: string
  name: string
  category: string
  amount: number
  date: string
  paymentMethod: string
  description: string
}

export type FinanceSummary = {
  totalOrders: number
  totalRevenue: number
  grossProfit: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  totalProducts: number
  totalStockValue: number
  targetProfit: number
}

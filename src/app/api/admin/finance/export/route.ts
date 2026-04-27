import { prisma } from "@/lib/prisma";
<<<<<<< HEAD

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { financeData: true },
    orderBy: { name: "asc" },
  });

  const header = [
    "Product",
    "Stock",
    "Cost / Unit ($)",
    "Delivery Cost ($)",
    "Total Cost / Unit ($)",
    "Sell Price ($)",
    "Discount (%)",
    "Final Price ($)",
    "Profit / Unit ($)",
    "Margin (%)",
    "Total Invested ($)",
    "Potential Revenue ($)",
    "Potential Profit ($)",
  ].join(",");

  let sumInvested = 0;
  let sumRevenue = 0;
  let sumProfit = 0;

  const rows = products.map((p) => {
    const bought = Number(p.financeData?.boughtPrice ?? 0);
    const delivery = Number(p.financeData?.deliveryPrice ?? 0);
    const sell = Number(p.price);
    const discountPct = Number(p.financeData?.discountPct ?? 0);
    const totalCost = bought + delivery;
    const finalPrice = sell * (1 - discountPct / 100);
    const profitPerUnit = finalPrice - totalCost;
    const margin = finalPrice > 0 ? (profitPerUnit / finalPrice) * 100 : 0;
    const invested = totalCost * p.stock;
    const revenue = finalPrice * p.stock;
    const profit = profitPerUnit * p.stock;

    sumInvested += invested;
    sumRevenue += revenue;
    sumProfit += profit;

    return [
      `"${p.name.replace(/"/g, '""')}"`,
      p.stock,
      bought.toFixed(2),
      delivery.toFixed(2),
      totalCost.toFixed(2),
      sell.toFixed(2),
      discountPct.toFixed(2),
      finalPrice.toFixed(2),
      profitPerUnit.toFixed(2),
      margin.toFixed(2),
      invested.toFixed(2),
      revenue.toFixed(2),
      profit.toFixed(2),
    ].join(",");
  });

  const totalRow = [
    "TOTAL",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    sumInvested.toFixed(2),
    sumRevenue.toFixed(2),
    sumProfit.toFixed(2),
  ].join(",");

  const csv = [header, ...rows, totalRow].join("\n");
  const date = new Date().toISOString().split("T")[0];

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="finance-${date}.csv"`,
=======
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const month = searchParams.get("month"); // "YYYY-MM"

  let where = {};
  if (month) {
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    where = { createdAt: { gte: start, lt: end } };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const header = [
    "Order ID",
    "Date",
    "Product",
    "Qty",
    "Bought Price",
    "Delivery Price",
    "Sell Price",
    "Discount %",
    "Discounted Price",
    "Revenue",
    "Cost",
    "Profit",
  ].join(",");

  const rows: string[] = [header];
  let sumRevenue = 0;
  let sumCost = 0;
  let sumProfit = 0;

  for (const order of orders) {
    for (const item of order.items) {
      const sell = Number(item.sellPrice);
      const disc = Number(item.discountPct);
      const bought = Number(item.boughtPrice);
      const delivery = Number(item.deliveryPrice);
      const qty = item.quantity;

      const discountedPrice = sell * (1 - disc / 100);
      const revenue = discountedPrice * qty;
      const cost = (bought + delivery) * qty;
      const profit = revenue - cost;

      sumRevenue += revenue;
      sumCost += cost;
      sumProfit += profit;

      rows.push(
        [
          order.orderId,
          order.createdAt.toISOString().split("T")[0],
          `"${item.productName.replace(/"/g, '""')}"`,
          qty,
          bought.toFixed(2),
          delivery.toFixed(2),
          sell.toFixed(2),
          disc.toFixed(2),
          discountedPrice.toFixed(2),
          revenue.toFixed(2),
          cost.toFixed(2),
          profit.toFixed(2),
        ].join(",")
      );
    }
  }

  rows.push(
    [
      "TOTAL",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      sumRevenue.toFixed(2),
      sumCost.toFixed(2),
      sumProfit.toFixed(2),
    ].join(",")
  );

  const filename = month ? `finance-${month}.csv` : "finance-all.csv";

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
>>>>>>> feat/finance
    },
  });
}
